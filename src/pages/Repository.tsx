import { Box, Divider, Link, Tab, Tabs, Typography } from "@mui/material";
import { nip19 } from "nostr-tools";
import { useMemo, useState } from "react";
import { useParams, useSearchParams, Link as RouterLink, useNavigate } from "react-router-dom";
import { File } from "../components/FileViewer";
import RepositoryCodeViewer from "../components/RepositoryCodeViewer";
import RepositoryIssues from "../components/RepositoryIssues";
import useNip05 from "../hooks/useNip05";
import usePromise from "../hooks/usePromise";
import useRefresh from "../hooks/useRefresh";
import ipfs, { ls } from "../ipfs";
import { fetchEventsByAuthorAndRepository, fetchEventsByRepository } from "../nostr";
import { getFileViewers, REPOSITORY_NAME_REGEX, VALIDE_FILE_URL_SCHEME } from "../utils";
import ErrorPage from "./ErrorPage";
import LoadingPage from "./LoadingPage";

export enum RepositoryTab {
    Files,
    Issues,
    Pulls
}
const tabs = ["", "issues", "pulls"] as const
const tabsNames = ["Code", "Issues", "Pull requests"] as const
export default function Repository(){
    const [modalOpen, setModalOpen] = useState(false)
    const {
        owner: owner_raw,
        name: name_raw
    } = useParams<{
        owner: string
        name: string
    }>()
    const [searchParams] = useSearchParams({
        path: "/"
    })
    const {
        tab
    } = useParams<{
        tab: string
    }>()
    const selectedTabIndex = useMemo(() => {
        switch(tab){
            case "issues": return RepositoryTab.Issues
            case "pulls": return RepositoryTab.Pulls
            case "files":
            default: return RepositoryTab.Files
        }
    }, [tab])
    const navigate = useNavigate()
    const path = useMemo(() => {
        const p = searchParams.get("path")
        if(!p?.startsWith("/"))return `/${p}`
        return p
    }, [searchParams])
    const [refreshId, refresh] = useRefresh()
    
    const owner = useMemo(() => {
        if(!owner_raw)return null
        const o = owner_raw.toLowerCase()
        if(/^[abcdef\d]{64}$/.test(o)){
            return o
        }
        try{
            const { type, data } = nip19.decode(o)
            if(type !== "npub"){
                return null
            }
            return data.toString()
        }catch(err){
            return null
        }
    }, [owner_raw])
    const name = useMemo(() => {
        if(!name_raw)return null
        const n = name_raw.toLowerCase()
        if(!REPOSITORY_NAME_REGEX.test(n))return null
        return n
    }, [name_raw])

    const owner_nip05 = useNip05(owner ?? undefined)

    const [
        events_loaded,
        events,
        events_error
    ] = usePromise(async () => {
        if(!owner)throw new Error("Invalid owner")
        if(!name)throw new Error("Invalid repository name")
        const events = await fetchEventsByAuthorAndRepository(owner, name)
        const validEvents = events.filter(event => {
            if(event.tags.find(t => t[0] === "p"))return false
            try{
                const url = new URL(event.content)
                if(!VALIDE_FILE_URL_SCHEME.has(url.protocol))return false
            }catch{
                return false
            }
            
            return true
        })
        
        if(!validEvents.length)throw new Error("Cannot find repository on relays")

        // only events, made by the owner, counted as commits
        return validEvents
    }, [owner, name, refreshId])
    const lastCommit = useMemo(() => {
        if(!events_loaded)return null
        if(events_error)return null
        if(!events?.length)return null
        return events[0]
    }, [events_loaded, events_error, events])
    const [
        issues_loaded,
        issues,
        issues_error
    ] = usePromise(async () => {
        if(selectedTabIndex !== RepositoryTab.Issues)return null
        if(!owner)return null
        if(!name)return null
        const events = await fetchEventsByRepository(owner, name)
        const validEvents = events.filter(event => {
            if(!event.tags.find(t => t[0] === "c"))return false

            return true
        })

        return validEvents
    }, [owner, name, refreshId, selectedTabIndex])
    const [
        files_loaded,
        files,
        files_error
    ] = usePromise(async () => {
        if(selectedTabIndex !== RepositoryTab.Files)return null
        if(!lastCommit)return null
        const url = new URL(lastCommit.content)
        switch(url.protocol){
            case "ipfs:": {
                const hash = lastCommit.content.match(/^ipfs:\/\/([^\\]+)/)?.[1]
                const result = []
                const res = await ls(`${hash}${path}`)
                for(const file of res){
                    result.push(file)
                }
                if(!result.length){
                    return []
                }
                if(!result.find(e => !!e.name)){
                    throw new Error(`IPFS Hash ${hash} is not a directory`)
                }
                return result
            }
        }
        throw new Error(`Unsupported protocol: ${url.protocol}`)
    }, [lastCommit?.content, path, refreshId, selectedTabIndex])
    const [
        file_loaded,
        file,
        file_error
    ] = usePromise<File>(async () => {
        if(selectedTabIndex !== RepositoryTab.Files)return null
        if(!lastCommit)return null
        const url = new URL(lastCommit.content)
        switch(url.protocol){
            case "ipfs:": {
                const hash = lastCommit.content.match(/^ipfs:\/\/([^\\]+)/)?.[1]
                let p = `${hash}${path}`
                if(files_loaded && files?.length){
                    // see if there's a readme in the dir, and display it
                    const readme = files.find(e => /readme(\.(txt|md))?/.test(e.name?.toLowerCase()))
                    if(readme){
                        p = `${hash}${path}${readme.name}`
                    }else{
                        throw new Error(`IPFS Hash ${hash} is a directory`)
                    }
                }
                const viewers = getFileViewers(p)
                let content = null
                let tooLarge = false
                if(viewers.find(
                    e => e[0] === "text" ||
                        e[0] === "markdown"
                )){
                    let result = []
                    let totalSize = 0
                    for await (const chunk of ipfs.cat(p)){
                        result.push(chunk)
                        totalSize += chunk.length

                        // limit to 1MB
                        if(totalSize > 1024 * 1024){
                            result = []
                            tooLarge = true
                            break
                        }
                    }
                    
                    content = new TextDecoder().decode(Buffer.concat(result))
                }
                return {
                    path: p,
                    viewers,
                    content,
                    too_large: tooLarge
                } as File
            }
        }
        throw new Error(`Unsupported protocol: ${url.protocol}`)
    }, [lastCommit?.content, path, files_loaded, files, refreshId, selectedTabIndex])

    if(!owner)return <ErrorPage
        title="Invalid repository"
        reason="The repository owner public key is invalid"
    />
    if(!name)return <ErrorPage
        title="Invalid repository"
        reason="The repository name is invalid"
    />

    if(!events_loaded)return <LoadingPage/>
    if(events_error)return <ErrorPage
        title="Failed to load repository"
        reason={events_error.message}
        onRefresh={refresh}
    />
    if(!lastCommit)return <ErrorPage
        title="Repository not found"
        reason="The repository does not exist"
        onRefresh={refresh}
    />
    switch(selectedTabIndex){
        case RepositoryTab.Files:
            if(!(file_loaded || files_loaded))return <LoadingPage/>
            if(files_error && file_error)return <ErrorPage
                title="Failed to load repository"
                reason={files_error.message+"\n"+file_error.message}
                onRefresh={refresh}
            />
            break
        case RepositoryTab.Issues:
            if(!issues_loaded)return <LoadingPage/>
            if(issues_error)return <ErrorPage
                title="Failed to load issues"
                reason={issues_error.message}
                onRefresh={refresh}
            />
            break
    }

    return <Box sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        padding: 4,
        alignItems: "center",
        minHeight: "var(--app-height)",
        width: "100%",
        textAlign: "center"
    }}>
        { /* repository header */}
        <Box sx={{
            display: "flex",
            flexDirection: "row",
            gap: 1,
            justifyContent: "start",
            width: "100%",
            flexWrap: "wrap"
        }}>
            { /* repository name */}
            <Box sx={{
                display: "flex",
                flexDirection: "row",
                gap: 1
            }}>
                <Link
                    to={`/${nip19.npubEncode(owner)}`}
                    component={RouterLink}
                >
                    <Typography
                        variant="body1"
                        fontFamily="'Overpass Mono', monospace"
                        sx={{
                            wordBreak: "break-all"
                        }}
                    >
                        {owner_nip05 || nip19.npubEncode(owner)}
                    </Typography>
                </Link>
                <Typography variant="body1" color="grey">
                    /
                </Typography>
                <Link
                    to={`/${nip19.npubEncode(owner)}/${name}`}
                    component={RouterLink}
                >
                    <Typography
                        variant="body1"
                        fontFamily="'Overpass Mono', monospace"
                        sx={{
                            wordBreak: "break-all"
                        }}
                    >
                        {name}
                    </Typography>
                </Link>
            </Box>
        </Box>

        <Box sx={{
            width: "100%"
        }}>
            <Tabs
                value={selectedTabIndex}
                onChange={(_, newValue) => {
                    navigate(`/${nip19.npubEncode(owner)}/${name}/${tabs[newValue]}`)
                }}
            >
                {tabsNames.map((tab, i) => <Tab
                    key={i}
                    label={tab}
                    value={i}
                    sx={{
                        textTransform: "none"
                    }}
                />)}
            </Tabs>

            <Divider sx={{
                width: "100%",
            }} />
        </Box>

        {([
            <RepositoryCodeViewer
                owner={owner}
                name={name}
                path={path}
                file={file}
                files={files}
                files_error={files_error}
                file_error={file_error}
                fileCreationModalOpen={modalOpen}
                setFileCreationModalOpen={setModalOpen}
            />,
            <RepositoryIssues
                owner={owner}
                name={name}
                issues={issues}
                newIssueModalOpen={modalOpen}
                setNewIssueModalOpen={setModalOpen}
                ipfs_hash={lastCommit.content.match(/^ipfs:\/\/([^\\]+)/)![1]}
            />,
        ])[selectedTabIndex]}
    </Box>
}