import { Add, Folder, InsertDriveFileOutlined } from "@mui/icons-material";
import { Box, IconButton, Link, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { nip19 } from "nostr-tools";
import { Fragment } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import FileViewer, { File } from "../components/FileViewer";
import Modal from "../components/Modal";
import useIsMobile from "../hooks/useIsMobile";
import ipfs, { EMPTY_FILE_IPFS_CID, makeTree, updateTree } from "../ipfs";
import FileCreationModal from "../modals/FileCreationModal";
import { fetchEventsByAuthorAndRepository, publishRevision } from "../nostr";
import AccountStore from "../stores/AccountStore";
import { formatFileSize, VALIDE_FILE_URL_SCHEME } from "../utils";

export default function RepositoryCodeViewer({
    owner,
    name,
    path,
    file,
    files,
    files_error,
    file_error,
    fileCreationModalOpen,
    setFileCreationModalOpen
}:{
    owner: string,
    name: string,
    path: string,
    file?: File,
    files?: any[],
    files_error?: Error,
    file_error?: Error,
    fileCreationModalOpen: boolean,
    setFileCreationModalOpen: (open: boolean) => void
}){
    const isMobile = useIsMobile()
    const navigate = useNavigate()
    return <Box sx={{
        width: "100%",
        maxWidth: "1200px",
        display: "flex",
        flexDirection: "column",
        gap: 2,
        alignItems: "center"
    }}>
        { /* Directory header */}
        <Box sx={{
            display: "flex",
            flexDirection: "row",
            gap: 1,
            justifyContent: "start",
            width: "100%",
            flexWrap: "wrap"
        }}>
            { /* Path */}
            <Box sx={{
                display: "flex",
                flexDirection: "row",
                gap: 1,
                flex: 1
            }}>
                {
                    [".", ...path.split("/")].map((p, i, arr) => {
                        if(!p)return null
                        const p2 = arr.slice(0, i + 1).slice(1).join("/") || "/"
                        return <Fragment key={p2}>
                            <Link
                                to={`/${nip19.npubEncode(owner)}/${name}?path=${p2}`}
                                component={RouterLink}
                            >
                                <Typography
                                    variant="body1"
                                    fontFamily="'Overpass Mono', monospace"
                                    sx={{
                                        wordBreak: "break-all"
                                    }}
                                >
                                    {p}
                                </Typography>
                            </Link>
                            <Typography variant="body1" color="grey">
                                /
                            </Typography>
                        </Fragment>
                    })
                }
            </Box>
            {!files_error && <IconButton
                onClick={() => {
                    setFileCreationModalOpen(true)
                }}
            >
                <Add/>
            </IconButton>}
            <Modal open={fileCreationModalOpen} onClose={() => setFileCreationModalOpen(false)}>
                <FileCreationModal onCreation={async (filename, buffer) => {
                    const _path = (path+"/"+filename).replace(/\/+/g, "/")
                    if(!buffer){
                        // empty file lol
                        const rootHash = await fetchEventsByAuthorAndRepository(owner, name)
                        .then(events => events.find(event => {
                            if(event.tags.find(t => t[0] === "p"))return false
                            try{
                                const url = new URL(event.content)
                                if(!VALIDE_FILE_URL_SCHEME.has(url.protocol))return false
                            }catch{
                                return false
                            }
                            
                            return true
                        })).then(event => event!.content.split("://")[1])
                        const tree = await makeTree(rootHash, _path)
                        tree[_path] = EMPTY_FILE_IPFS_CID
                        const newRootHash = await updateTree(ipfs, tree, _path)

                        await publishRevision(
                            name,
                            `ipfs://${newRootHash}`,
                            `Create file ${_path}`,
                        )
                        
                        // relays might be a bit slow, avoid errors when reloading
                        await new Promise(r => setTimeout(r, 2000))
                        navigate(`/${nip19.npubEncode(owner)}/${name}/edit?path=${_path}`)
                    }else{
                        // upload
                        const result = await ipfs.add({
                            content: buffer
                        })
                        const cid = result.cid.toString()
                        const rootHash = await fetchEventsByAuthorAndRepository(owner, name)
                        .then(events => events.find(event => {
                            if(event.tags.find(t => t[0] === "p"))return false
                            try{
                                const url = new URL(event.content)
                                if(!VALIDE_FILE_URL_SCHEME.has(url.protocol))return false
                            }catch{
                                return false
                            }
                            
                            return true
                        })).then(event => event!.content.split("://")[1])
                        const tree = await makeTree(rootHash, _path)
                        tree[_path] = cid
                        const newRootHash = await updateTree(ipfs, tree, _path)

                        await publishRevision(
                            name,
                            `ipfs://${newRootHash}`,
                            `Added file ${_path} via upload`,
                        )
                        // relays might be a bit slow, avoid errors when reloading
                        await new Promise(r => setTimeout(r, 2000))
                        navigate(`/${nip19.npubEncode(owner)}/${name}?path=${_path}`)
                        setFileCreationModalOpen(false)
                    }
                }} path={path}/>
            </Modal>
        </Box>

        { /* Directory content */}
        {!files_error && files?.length && <Paper elevation={0} sx={{
            width: "100%"
        }}>
            <TableContainer>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{
                                width: "1px"
                            }}>Type</TableCell>
                            <TableCell>Name</TableCell>
                            {!isMobile && <TableCell align="right">Size</TableCell>}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {files && files!.sort((a, b) => {
                            if(a.type === "dir" && b.type !== "dir")return -1
                            if(a.type !== "dir" && b.type === "dir")return 1
                            return a.name.localeCompare(b.name)
                        }).map((file, i) => {
                            const p = `${path}/${file.name}`.replace(/^\/+/g, "/")
                            return <TableRow
                                key={i}
                                sx={{
                                    "&:last-child td, &:last-child th": {
                                        border: 0
                                    }
                                }}
                            >
                                <TableCell>
                                    {file.type === "dir" ? <Folder /> : <InsertDriveFileOutlined />}
                                </TableCell>
                                <TableCell>
                                    <Link
                                        to={`/${nip19.npubEncode(owner)}/${name}?path=${p}`}
                                        component={RouterLink}
                                    >
                                        <Typography
                                            variant="body1"
                                            fontFamily="'Overpass Mono', monospace"
                                            sx={{
                                                wordBreak: "break-all"
                                            }}
                                        >
                                            {file.name}
                                        </Typography>
                                    </Link>
                                </TableCell>
                                {!isMobile && <TableCell align="right">
                                    <Typography
                                        variant="body1"
                                        fontFamily="'Overpass Mono', monospace"
                                        sx={{
                                            wordBreak: "break-all"
                                        }}
                                    >
                                        {file.type !== "dir" && formatFileSize(file.size)}
                                    </Typography>
                                </TableCell>}
                            </TableRow>
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper> || null}

        { /* File content */}
        {!file_error && file && <Paper elevation={0} sx={{
            width: "100%"
        }}>
            <FileViewer
                file={file}
                show_edit_button={AccountStore.publicKey === owner}
                edit_path={`/${nip19.npubEncode(owner)}/${name}/edit?path=${file.path.split("/").slice(1).join("/")}`}
            />
        </Paper>}
    </Box>
}