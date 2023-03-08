import { Alert, Box, Divider, Tab, Tabs, Typography } from "@mui/material"
import { useState } from "react"
import SwipeableViews from "react-swipeable-views"
import { CodeHighlighter } from "./CodeHighlighter"
import { IPFS_URL } from "../ipfs"
import Markdown from "./Markdown"

export interface File {
    path: string,
    content: string | null,
    viewers: [string, string][],
    too_large: boolean
}

export default function FileViewer({
    file
}:{
    file: File
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
                    return <Tab label={viewer[0]} key={index} />
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
                return <Viewer file={file} index={index} key={index} />
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
            return <Box sx={{
                padding: 2,
                width: "100%",
                textAlign: "left",
                display: "flex",
                flexDirection: "column",
                gap: 1
            }}>
                <Typography variant="h4" fontWeight="bolder">
                    {file.path.split("/").pop()}
                </Typography>
                <Divider />
                {file.too_large ? <Alert variant="filled" severity="error">
                    File too large to display.
                </Alert> : <Markdown document={file.content!}/> }
            </Box>
        case "text":
            return <Box sx={{
                padding: 2,
                width: "100%",
                textAlign: "left",
                display: "flex",
                flexDirection: "column",
                gap: 1
            }}>
                <Typography variant="h4" fontWeight="bolder">
                    {file.path.split("/").pop()}
                </Typography>
                <Divider />
                {file.too_large ? <Alert variant="filled" severity="error">
                    File too large to display.
                </Alert> : <CodeHighlighter
                    language={viewer[1]}
                    code={file.content!}
                />}
            </Box>
        case "image": {
            const link = `${IPFS_URL}/ipfs/${file.path}`
            return <Box sx={{
                padding: 2,
                width: "100%",
                textAlign: "left",
                display: "flex",
                flexDirection: "column",
                gap: 1
            }}>
                <Typography variant="h4" fontWeight="bolder">
                    {file.path.split("/").pop()}
                </Typography>
                <Divider />
                <img src={link} alt={file.path} style={{
                    width: "100%",
                    height: "auto"
                }} />
            </Box>
        }

    }

    return null
}