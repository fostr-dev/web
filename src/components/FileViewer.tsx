import { Alert, Box, Divider, IconButton, Link, Tab, Tabs, Typography } from "@mui/material"
import { useState } from "react"
import SwipeableViews from "react-swipeable-views"
import { CodeHighlighter } from "./CodeHighlighter"
import { IPFS_URL } from "../ipfs"
import Markdown from "./Markdown"
import { firstLetterUppercase } from "../utils"
import { Create, Download, RawOn } from "@mui/icons-material"
import { Link as RouterLink } from "react-router-dom"

export interface File {
    path: string,
    content: string | null,
    viewers: [string, string][],
    too_large: boolean
}

export default function FileViewer({
    file,
    show_edit_button = false,
    edit_path
}:{
    file: File,
    show_edit_button?: boolean,
    edit_path?: string
}){
    const [selectedViewer, setSelectedViewer] = useState(0)

    return <Box sx={{}}>
        <Box sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center"
        }}>
            <Tabs
                value={selectedViewer}
                onChange={(_, newValue) => {
                    setSelectedViewer(newValue)
                }}
            >
                {file.viewers.map((viewer, index) => {
                    return <Tab
                        label={viewer[0] === "text" ? `Code (${viewer[1]})` : firstLetterUppercase(viewer[0])}
                        key={index}
                        sx={{
                            textTransform: "none"
                        }}
                    />
                })}
            </Tabs>
        </Box>
        <SwipeableViews
            index={selectedViewer}
            style={{
                width: "100%"
            }}
        >
            {file.viewers.map((viewer, index) => {
                return <Box sx={{
                    padding: 2,
                    width: "100%",
                    textAlign: "left",
                    display: "flex",
                    flexDirection: "column",
                    gap: 1
                }} key={index}>
                    <Box sx={{
                        display: "flex",
                        flexDirection: "row"
                    }}>
                        <Typography variant="h4" fontWeight="bolder">
                            {file.path.split("/").pop()}
                        </Typography>
                        <Box sx={{
                            flexGrow: 1
                        }}/>
                        {show_edit_button && <Link
                            to={edit_path!}
                            component={RouterLink}
                        >
                            <IconButton>
                                <Create />
                            </IconButton>
                        </Link>}
                        <Link
                            href={`${IPFS_URL}/ipfs/${file.path}`}
                            target="_blank"
                            rel="noreferrer"
                        >
                            <IconButton>
                                <RawOn />
                            </IconButton>
                        </Link>
                        <Link
                            href={`${IPFS_URL}/ipfs/${file.path}?download=true&filename=${file.path.split("/").pop()}`}
                            target="_blank"
                            rel="noreferrer"
                        >
                            <IconButton>
                                <Download />
                            </IconButton>
                        </Link>
                    </Box>
                    <Divider/>
                    <Viewer file={file} index={index} />
                </Box>
            })}
        </SwipeableViews>
    </Box>
}
export function Viewer({
    file,
    index
}:{
    file: File,
    index: number
}){
    const viewer = file.viewers[index]
    switch(viewer[0]){
        case "markdown":
            return file.too_large ? <Alert variant="filled" severity="error">
            File too large to display.
        </Alert> : <Markdown
            document={file.content!}
            relative_path={`${IPFS_URL}/ipfs/${file.path.split("/").slice(0, -1).join("/")}`}
        />
        case "text":
            return file.too_large ? <Alert variant="filled" severity="error">
                File too large to display.
            </Alert> : <CodeHighlighter
                language={viewer[1]}
                code={file.content!}
            />
        case "image": {
            const link = `${IPFS_URL}/ipfs/${file.path}`
            return <Box sx={{
                width: "100%",
                height: "100%",
                alignSelf: "center",
            }}>
                <img src={link} alt={file.path} style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain"
                }} />
            </Box>
        }

    }

    return null
}