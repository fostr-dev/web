import { CheckCircle, Close } from "@mui/icons-material"
import { Box, Button, Card, CircularProgress, Link, TextField, Typography } from "@mui/material"
import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import usePromise from "../hooks/usePromise"
import { fetchEventsByAuthorAndRepository, publishRevision } from "../nostr"
import AccountStore from "../stores/AccountStore"
import ErrorPage from "./ErrorPage"
import { REPOSITORY_NAME_REGEX } from "../utils"
import { LoadingButton } from "@mui/lab"
import ipfs, { EMPTY_DIRECTORY_IPFS_CID } from "../ipfs"
import SwipeableViews from "react-swipeable-views"
import { toast } from "react-hot-toast"
import FilePicker from "../components/FilePicker"

export default function NewRepository(){
    const account = AccountStore.publicKey
    const navigate = useNavigate()

    const [repositoryName, setRepositoryName] = useState("")

    const [
        repository_available_loaded,
        repository_available,
        repository_available_error
    ] = usePromise(async () => {
        if(!repositoryName || !account)return false
        if(!REPOSITORY_NAME_REGEX.test(repositoryName))return false
        const events = await fetchEventsByAuthorAndRepository(account, repositoryName)
        return events.length === 0
    }, [repositoryName, account])

    const repositoryError = useMemo(() => {
        if(!repositoryName)return "No repository name provided"
        if(!REPOSITORY_NAME_REGEX.test(repositoryName))return "Repository name is invalid"
        if(!repository_available_loaded)return "Checking if repository name is available..."
        if(repository_available_error)return repository_available_error.message
        if(!repository_available)return "You already have a repository with this name"
        return null
    }, [repositoryName, repository_available_loaded, repository_available, repository_available_error])

    const [buttonLoading, setButtonLoading] = useState(false)
    const [view, setView] = useState<"create" | "upload">("create")
    const [files, setFiles] = useState<File[]>([])
    const viewIndex = useMemo(() => {
        return ["create", "upload"].indexOf(view)
    }, [view])

    if(!account)return <ErrorPage
        title="You are not logged in"
        reason="You need to be logged in to create a new repository"
        showLogin
    />

    return <Box sx={{
        minHeight: "var(--app-height)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",

        ".card-group": {
            display: "flex",
            flexDirection: "row",
            gap: 2,
            padding: 2,
            justifyContent: "center",
            flexWrap: "wrap",
            width: "100%",

            "& > *": {
                width: "100%",
                maxWidth: 600,
                padding: 2,
                display: "flex",
                flexDirection: "column",
                gap: 2,
                alignItems: "center",
                textAlign: "center",

                "& > *": {
                    width: "100%"
                }
            }
        }
    }}>
        <SwipeableViews
            index={viewIndex}
            style={{
                width: "100%"
            }}
        >
            <Box className="card-group">
                <Card elevation={0}>
                    <Typography variant="h4" fontWeight="bolder">
                        New Repository
                    </Typography>
                    <Typography variant="body1">
                        Create a new repository
                    </Typography>

                    <TextField
                        label="Repository Name"
                        value={repositoryName}
                        onChange={(e) => setRepositoryName(e.target.value?.toLowerCase() ?? "")}
                        error={!!repositoryName && !!repositoryError}
                        helperText={repositoryName && repositoryError}
                        InputProps={{
                            endAdornment: !repositoryName && <></> || repository_available_loaded && repository_available && <CheckCircle sx={{
                                color: "success.main"
                            }}/> || !repository_available_loaded && <CircularProgress size={20} sx={{
                                color: "text.secondary"
                            }}/> || !repository_available && <Close sx={{
                                color: "error.main"
                            }}/>
                        }}
                    />

                    <Box sx={{
                        display: "flex",
                        flexDirection: "row",
                        gap: 2,
                        width: "100%",
                        justifyContent: "center",

                        "& > *": {
                            width: "100%"
                        }
                    }}>
                        <LoadingButton
                            variant="contained"
                            disabled={!!repositoryError || view !== "create"}
                            color="primary"
                            loading={buttonLoading}
                            onClick={async () => {
                                try{
                                    setButtonLoading(true)
                                    const repository = await publishRevision(
                                        repositoryName,
                                        `ipfs://${EMPTY_DIRECTORY_IPFS_CID}`
                                    )
                                    console.log(repository)
                                    navigate(`/${account}/${repositoryName}`)
                                }catch(err){
                                    console.error(err)
                                    toast.error("Failed to create repository")
                                    setButtonLoading(false)
                                }
                            }}
                        >
                            Create Empty Repository
                        </LoadingButton>
                        <Button
                            variant="contained"
                            disabled={!!repositoryError || buttonLoading}
                            color="secondary"
                            onClick={() => {
                                setView("upload")
                            }}
                        >
                            Create And Upload Files
                        </Button>
                    </Box>
                </Card>
            </Box>


            <Box className="card-group">
                <Card elevation={0}>
                    <Typography variant="h4" fontWeight="bolder">
                        Upload Files
                    </Typography>
                    <Typography variant="body1">
                        Upload files to your new repository
                    </Typography>
                    
                    <FilePicker onChange={(files) => {
                        setFiles(files)
                    }} value={files} disabled={buttonLoading} />

                    <LoadingButton
                        variant="contained"
                        onClick={async () => {
                            try{
                                setButtonLoading(true)
                                toast("Uploading files on ipfs...")
                                const f = []
                                for(const file of files){
                                    const isDirectory = file.name.endsWith("/")
                                    f.push({
                                        path: file.name.slice(1, isDirectory?-1:undefined), // remove leading slash,
                                        content: isDirectory ? undefined : await file.arrayBuffer()
                                    })
                                }
                                const result = ipfs.addAll(f, {
                                    wrapWithDirectory: true
                                })
                                let cid = null
                                for await(const file of result){
                                    console.log(file)
                                    if(file.path === ""){
                                        cid = file.cid.toV0()
                                        break
                                    }
                                }
                                if(!cid){
                                    throw new Error("Failed to upload files")
                                }
                                toast("Files uploaded on ipfs")
                                const repository = await publishRevision(
                                    repositoryName,
                                    `ipfs://${cid}`
                                )
                                console.log(repository)
                                navigate(`/${account}/${repositoryName}`)
                            }catch(err){
                                console.error(err)
                                toast.error("Failed to create repository")
                                setButtonLoading(false)
                            }
                        }}
                        color="secondary"
                        disabled={!files.length}
                        loading={buttonLoading}
                    >
                        Create Repository
                    </LoadingButton>
                    <Typography variant="body2" textAlign="start">
                        Don't like this name? <Link onClick={() => {
                            setView("create")
                        }} sx={{
                            cursor: "pointer"
                        }}>Change name</Link>
                    </Typography>
                </Card>
            </Box>
        </SwipeableViews>
    </Box>
}