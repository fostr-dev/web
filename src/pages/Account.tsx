import { Alert, Avatar, Box, Card, Chip, CircularProgress, Grid, Link, Typography } from "@mui/material";
import { nip19 } from "nostr-tools";
import { useMemo } from "react";
import { useParams } from "react-router-dom";
import usePromise from "../hooks/usePromise";
import { fetchEventsByAuthor, getProfileInfo, validateNip05 } from "../nostr";
import { VALIDE_FILE_URL_SCHEME } from "../utils";
import ErrorPage from "./ErrorPage";
import LoadingPage from "./LoadingPage";
import { Link as RouterLink } from "react-router-dom";

export default function Account(){
    const { account: account_raw } = useParams<{account: string}>()
    
    const account = useMemo(() => {
        if(!account_raw)return null
        const o = account_raw.toLowerCase()
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
    }, [account_raw])

    const [
        profile_loaded,
        profile,
        profile_error
    ] = usePromise(async (params) => {
        if(!account)return null
        const profile = await getProfileInfo(account)

        if(params.cancel)return null

        if(profile.nip05){
            if(!await validateNip05(account, profile.nip05)){
                delete profile.nip05
            }
        }
        return profile
    }, [account])
    const [
        repositories_loaded,
        repositories,
        repositories_error
    ] = usePromise(async (params) => {
        if(!account)return null
        const events = await fetchEventsByAuthor(account)

        if(params.cancel)return null

        const validEvents = events.filter(event => {
            if(event.tags.find(t => t[0] === "p"))return false
            if(!event.tags.find(t => t[0] === "b"))return false
            try{
                const url = new URL(event.content)
                if(!VALIDE_FILE_URL_SCHEME.has(url.protocol))return false
            }catch{
                return false
            }
            
            return true
        })
        if(!validEvents.length)return []
        
        const repositories = new Set<string>()

        for(const event of validEvents){
            repositories.add(event.tags.find(t => t[0] === "b")![1].toLowerCase())
        }

        return [...repositories]
    }, [account])

    const display_account = useMemo(() => {
        if(!account)return
        return nip19.npubEncode(account)
    }, [account])

    if(!account)return <ErrorPage
        title="Invalid account"
        reason="The account you provided is invalid"
    />

    if(!profile_loaded)return <LoadingPage/>
    if(profile_error)return <ErrorPage
        title="Error loading profile"
        reason={profile_error.message}
    />
    const name = profile?.display_name ?? profile?.name
    const hasName = !!name

    return <Box sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        padding: 2,
        alignItems: "center",
        justifyContent: "center",
        maxHeight: "var(--app-height)",
        width: "100%",
        textAlign: "center"
    }}>
        <Typography variant="h4" fontWeight="bolder" sx={{
            wordBreak: "break-all",
            ...(hasName ? {} : {fontFamily: "'Overpass Mono', monospace'"})
        }}>
            {name ?? display_account}
        </Typography>
        {hasName && <Typography variant="body1" sx={{
            wordBreak: "break-all",
            fontFamily: "'Overpass Mono', monospace"
        }}>
            {display_account}
        </Typography>}
        {profile?.nip05 && <Chip label={profile.nip05}/>}
        <Avatar alt={name || display_account} src={profile?.picture} sx={{
            maxWidth: "50%",
            maxHeight: 250,
            width: "auto",
            height: "auto",
            aspectRatio: "1/1"
        }} />

        <Typography variant="h5" fontWeight="bolder">
            Repositories
        </Typography>
        {repositories_loaded && repositories_error && <Typography variant="body1">
            Error loading repositories: {repositories_error.message}
        </Typography>}
        {repositories_loaded && !repositories?.length && <Alert severity="warning">
            This user does not own any repository.
        </Alert>}
        {repositories_loaded && !repositories_error && repositories && <Grid container spacing={2} sx={{
            width: "100%",
            justifyContent: "center"
        }}>
            {repositories.map(repo => <Grid item key={repo}>
                <Link
                    to={`/${account}/${repo}`}
                    component={RouterLink}
                >
                    <Card sx={{
                        padding: 2
                    }} elevation={0}>
                        <Typography variant="h6" fontWeight="bolder">
                            {repo}
                        </Typography>
                    </Card>
                </Link>
            </Grid>)}
        </Grid>}
        {!repositories_loaded && <CircularProgress/>}
    </Box>
}