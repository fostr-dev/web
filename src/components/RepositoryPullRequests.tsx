import { Add, ArrowBack } from "@mui/icons-material"
import { Alert, Box, IconButton } from "@mui/material"
import { Event } from "nostr-tools"
import { useNavigate, useParams } from "react-router-dom"
import { createPullRequest, fetchEventsByAuthorAndRepository } from "../nostr"
import Modal from "./Modal"
import RepositoryIssue from "./RepositoryIssue"
import { RepositoryIssueList } from "./RepositoryIssues"
import NewPullRequest from "../modals/NewPullRequest"
import { VALIDE_FILE_URL_SCHEME } from "../utils"
import AccountStore from "../stores/AccountStore"

export default function RepositoryPullRequests({
    owner,
    name,
    pulls,
    ipfs_hash,
    newPullRequestModalOpen,
    setNewPullRequestModalOpen,
}:{
    owner: string,
    name: string,
    pulls?: Event[],
    ipfs_hash: string,
    newPullRequestModalOpen: boolean,
    setNewPullRequestModalOpen: (open: boolean) => void
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
            {id && <IconButton onClick={() => navigate(`/${owner}/${name}/pulls`)}>
                <ArrowBack />
            </IconButton>}
            <Box sx={{flex: 1}}/>
            <IconButton onClick={() => setNewPullRequestModalOpen(true)}>
                <Add />
            </IconButton>

            <Modal open={newPullRequestModalOpen} onClose={() => setNewPullRequestModalOpen(false)}>
                <NewPullRequest
                    owner={owner}
                    name={name}
                    onSubmit={async (title, repository) => {
                        const unchecked = await fetchEventsByAuthorAndRepository(AccountStore.publicKey!, repository)
                        const events = unchecked.filter(event => {
                            if(event.tags.find(t => t[0] === "p"))return false
                            try{
                                const url = new URL(event.content)
                                if(!VALIDE_FILE_URL_SCHEME.has(url.protocol))return false
                            }catch{
                                return false
                            }
                            
                            return true
                        })
                        
                        if(!events.length)throw new Error("This repository does not exist")
                        const lastCommit = events[0]
                        const event = await createPullRequest(owner, name, title, lastCommit.content)
                        navigate(`/${owner}/${name}/pulls/${event.id}`)
                        setNewPullRequestModalOpen(false)
                    }}
                />
            </Modal>
        </Box>

        {!id ? <RepositoryIssueList
            owner={owner}
            name={name}
            issues={pulls}
            isPullRequest
        /> : !pulls?.find(pull => pull.id === id) ? <Alert severity="error" sx={{
            width: "100%"
        }}>
            Pull Request not found
        </Alert> : <RepositoryIssue
            owner={owner}
            name={name}
            issue={pulls.find(pull => pull.id === id)!}
            ipfs_hash={ipfs_hash}
            isPullRequest
        />}
    </Box>
}