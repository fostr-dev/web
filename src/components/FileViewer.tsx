import { Box, Tab, Tabs, Typography } from "@mui/material"
import { useState } from "react"
import SwipeableViews from "react-swipeable-views"
import ReactMarkdown from "react-markdown"

export interface File {
    path: string,
    content: string | null,
    viewers: [string, string][]
}

export default function FileViewer({
    file
}:{
    file: File
}){
    const [selectedViewer, setSelectedViewer] = useState(0)
    const viewer = file.viewers[selectedViewer]

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
    switch(file.viewers[index][0]){
        case "markdown":
            return <Box sx={{
                padding: 2,
                width: "100%",
                textAlign: "left"
            }}>
                <Typography variant="h4" fontWeight="bolder">
                    {file.path.split("/").pop()}
                </Typography>
                <ReactMarkdown>
                    {file.content!}
                </ReactMarkdown>
            </Box>
    }

    return null
}