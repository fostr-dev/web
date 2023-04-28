import { Alert, Box, Button, Card, CircularProgress, TextField, Typography } from "@mui/material";
import usePromise from "../hooks/usePromise";
import { fetchEventsByAuthor } from "../nostr";
import AccountStore from "../stores/AccountStore";
import { VALIDE_FILE_URL_SCHEME } from "../utils";
import { useState } from "react";
import useNip05 from "../hooks/useNip05";
import { nip19 } from "nostr-tools";
import { LoadingButton } from "@mui/lab";
import useAppEvent from "../hooks/useAppEvent";

export default function NewPullRequest({
    owner,
    name,
    onSubmit
}:{
    owner: string,
    name: string,
    onSubmit: (title: string, repository: string) => Promise<void>
}){
    const [selectedRepository, setSelectedRepository] = useState<string | null>(null)
    const [title, setTitle] = useState<string|null>(null)
    const [loading, setLoading] = useState(false)
    const user_nip05 = useNip05(AccountStore.publicKey ?? undefined)
    const owner_nip05 = useNip05(owner)
    useAppEvent("AccountStore:change")

    const [
        repositories_loaded,
        repositories,
        repositories_error
    ] = usePromise(async (params) => {
        if(!AccountStore.publicKey)return []
        const events = await fetchEventsByAuthor(AccountStore.publicKey)

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
    }, [AccountStore.publicKey])

    if(selectedRepository === null){
        return <Box sx={{
            display: "flex",
            padding: 2,
            flexDirection: "column",
            gap: 2,
            alignItems: "center"
        }}>
            <Typography variant="h6">
                Select a repository to merge from
            </Typography>
            <Box sx={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                flexWrap: "wrap"
            }}>
                {repositories_loaded ? repositories_error ? <Alert severity="error">
                    {repositories_error.message}
                </Alert> : repositories!.length ? repositories!.map(repository => <Button
                    onClick={() => {
                        setSelectedRepository(repository)
                    }}
                >
                    <Card variant="outlined" sx={{
                        padding: 1,
                        width: "100%",
                        textTransform: "none"
                    }}>
                        {repository}
                    </Card>
                </Button>) : <Alert severity="info">
                    No repositories found
                </Alert> : <CircularProgress />}
            </Box>
        </Box>
    }else{
        return <Box sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1,
            padding: 2,
            alignItems: "center",
            justifyContent: "center",
            maxHeight: "var(--app-height)",
            width: "100%",
            textAlign: "center"
        }}>
            <Typography variant="h6">
                Pull Request Summary
            </Typography>
            <Typography>
                You are merging
            </Typography>
            <Typography sx={{
                fontWeight: "bold",
                fontFamily: "'Overpass Mono', monospace",
                color: "primary.main"
            }}>
                {user_nip05 || nip19.npubEncode(AccountStore.publicKey!)}/{selectedRepository}
            </Typography>
            <Typography>
                into
            </Typography>
            <Typography sx={{
                fontWeight: "bold",
                fontFamily: "'Overpass Mono', monospace",
                color: "secondary.main"
            }}>
                {owner_nip05 || nip19.npubEncode(owner)}/{name}
            </Typography>
            <TextField
                label={"Pull Request Title"}
                value={title}
                onChange={e => setTitle(e.target.value)}
                fullWidth
                disabled={loading}
            />
            <Box sx={{
                display: "flex",
                flexDirection: "row",
                gap: 1,
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
                marginTop: 2
            }}>
                <Button
                    variant="contained"
                    onClick={() => {
                        setSelectedRepository(null)
                    }}
                    sx={{
                        flex: 1
                    }}
                    color="error"
                    disabled={loading}
                >
                    Change Repository
                </Button>
                <LoadingButton
                    variant="contained"
                    onClick={async () => {
                        setLoading(true)
                        try{
                            await onSubmit(title!, selectedRepository!)
                            return
                        }catch(err){
                            console.error(err)
                            alert("An error occured while creating the pull request; Check console")
                        }finally{
                            setLoading(false)
                        }
                    }}
                    sx={{
                        flex: 1
                    }}
                    color="primary"
                >
                    Create Pull Request
                </LoadingButton>
            </Box>
        </Box>
    }
}