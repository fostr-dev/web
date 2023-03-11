import { CheckCircle, Close } from "@mui/icons-material"
import { Box, Button, Card, CircularProgress, TextField, Typography } from "@mui/material"
import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import useDragAndDrop from "../hooks/useDragAndDrop"
import useDragOver from "../hooks/useDragOver"
import usePromise from "../hooks/usePromise"
import { fetchEventsByAuthorAndRepository, publishRevision } from "../nostr"
import AccountStore from "../stores/AccountStore"
import ErrorPage from "./ErrorPage"
import { REPOSITORY_NAME_REGEX } from "../utils"
import { LoadingButton } from "@mui/lab"
import { EMPTY_DIRECTORY_IPFS_CID } from "../ipfs"

export default function NewRepository(){
    const account = AccountStore.publicKey
    const navigate = useNavigate()

    useEffect(() => {
        if(!account){
            navigate("/login")
        }
    }, [account])

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

    if(!account)return <ErrorPage
        title="You are not logged in"
        reason="You need to be logged in to create a new repository"
        showLogin
    />

    return <Box sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 2,
        gap: 2,
        minHeight: "var(--app-height)"
    }}>
        <Card sx={{
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
        }} elevation={0}>
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
                    disabled={!!repositoryError}
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
                >
                    Create And Upload Files
                </Button>
            </Box>
        </Card>
    </Box>
}