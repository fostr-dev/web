import { Add } from "@mui/icons-material"
import { Alert, Box, Card, IconButton, Link, Paper, Typography } from "@mui/material"
import { Event, nip19 } from "nostr-tools"
import { useNavigate, useParams } from "react-router-dom"
import useNip05 from "../hooks/useNip05"
import { createIssue } from "../nostr"
import Modal from "./Modal"
import RepositoryIssueEditor from "./RepositoryIssueEditor"
import { Link as RouterLink } from "react-router-dom"
import RepositoryIssue from "./RepositoryIssue"

export function RepositoryIssueCard({
    issue,
    owner,
    name
}:{
    issue: Event,
    owner: string,
    name: string
}){
    const nip05 = useNip05(issue.pubkey)
    console.log(issue)
    return <Card sx={{
        width: "100%",
        display: "flex",
        flexDirection: "row",
        gap: 2,
        alignItems: "center",
        justifyContent: "start",
        padding: 2
    }} variant="outlined">
        <Link
            component={RouterLink}
            to={`/${nip19.npubEncode(issue.pubkey)}`}
        >
            <Typography sx={{
                fontWeight: "bold",
                fontFamily: "'Overpass Mono', monospace",
                wordBreak: "break-all"
            }}>
                {nip05 || nip19.npubEncode(issue.pubkey)}
            </Typography>
        </Link>
        <Link
            component={RouterLink}
            to={`/${nip19.npubEncode(owner)}/${name}/issues/${issue.id}`}
            sx={{
                color: "white",
                textDecoration: "none",
                "&:hover": {
                    textDecoration: "underline"
                },
                flex: 1,
                textAlign: "left"
            }}
        >
            <Typography variant="h6" sx={{
                wordBreak: "break-all"
            }}>
                {issue.tags.find(tag => tag[0] === "c")?.[1] || "Untitled"}
            </Typography>
        </Link>
        <Link
            component={RouterLink}
            to={`/${nip19.npubEncode(owner)}/${name}/issues/${issue.id}`}
            sx={{
                textDecoration: "none",
                "&:hover": {
                    textDecoration: "underline"
                }
            }}
        >
            <Typography variant="body2" sx={{
                color: "grey.500",
                wordBreak: "break-all",
                fontFamily: "'Overpass Mono', monospace"    
            }}>
                {issue.id.slice(0, 8)}…{issue.id.slice(-8)}
            </Typography>
        </Link>
    </Card>
}

export default function RepositoryIssues({
    owner,
    name,
    issues,
    ipfs_hash,
    newIssueModalOpen,
    setNewIssueModalOpen,
}:{
    owner: string,
    name: string,
    issues?: Event[],
    ipfs_hash: string,
    newIssueModalOpen: boolean,
    setNewIssueModalOpen: (open: boolean) => void
}){
    const {
        id
    } = useParams<{id?: string}>()
    const navigate = useNavigate()
    return <Box sx={{
        width: "100%",
        maxWidth: "1200px",
        display: "flex",
        flexDirection: "column",
        gap: 2,
        alignItems: "center"
    }}>
        <Box sx={{
            display: "flex",
            flexDirection: "row",
            gap: 2,
            alignItems: "center",
            justifyContent: "center",
            width: "100%"
        }}>
            <Box sx={{flex: 1}}/>
            <IconButton onClick={() => setNewIssueModalOpen(true)}>
                <Add />
            </IconButton>

            <Modal open={newIssueModalOpen} onClose={() => setNewIssueModalOpen(false)}>
                <RepositoryIssueEditor
                    allowTitle
                    onSubmit={(title, content) => {
                        createIssue(owner, name, title, content)
                        .then(event => {
                            navigate(`/${owner}/${name}/issues/${event.id}`)
                        })
                    }}
                />
            </Modal>
        </Box>

        {!id ? <RepositoryIssueList
            owner={owner}
            name={name}
            issues={issues}
        /> : !issues?.find(issue => issue.id === id) ? <Alert severity="error" sx={{
            width: "100%"
        }}>
            Issue not found
        </Alert> : <RepositoryIssue
            owner={owner}
            name={name}
            issue={issues.find(issue => issue.id === id)!}
            ipfs_hash={ipfs_hash}
        />}
    </Box>
}

export function RepositoryIssueList({
    owner,
    name,
    issues
}:{
    owner: string,
    name: string,
    issues?: Event[]
}){
    return  <Paper sx={{
        width: "100%",
        padding: 2,
        display: "flex",
        flexDirection: "column",
        gap: 2,
        alignItems: "center"
    }} elevation={0}>
        {
            issues?.length ? issues.map(issue => <RepositoryIssueCard
                issue={issue}
                owner={owner}
                name={name}
                key={issue.id}
            />) : <Alert severity="warning" sx={{
                width: "100%"
            }}>
                No issues found for <span style={{
                    fontWeight: "bold",
                    fontFamily: "'Overpass Mono', monospace"
                }}>{owner}/{name}</span>
            </Alert>
        }
    </Paper>
}