import { LoadingButton } from "@mui/lab"
import { Box, Button, TextField, Typography } from "@mui/material"
import { useMemo, useState } from "react"
import { toast } from "react-hot-toast"
import SwipeableViews from "react-swipeable-views"
import FilePicker from "../components/FilePicker"

export default function FileCreationModal({
    onCreation,
    path
}:{
    onCreation: (filename: string, buffer?: Uint8Array) => void,
    path: string
}){
    if(!path.endsWith("/")) path += "/"
    const [filename, setFilename] = useState("")
    const [view, setView] = useState<"create" | "upload">("create")
    const viewIndex = useMemo(() => {
        return ["create", "upload"].indexOf(view)
    }, [view])
    const [files, setFiles] = useState<File[]>([])
    const [buttonLoading, setButtonLoading] = useState(false)

    return <SwipeableViews
        index={viewIndex}
        style={{
            width: "100%"
        }}
    >
        <Box sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            alignItems: "center",
            justifyContent: "center",
            height: "100%"
        }}>
            <Typography variant="h4" fontWeight="bolder">
                File Name
            </Typography>
            <TextField
                label="File Name"
                value={filename}
                onChange={e => setFilename(e.target.value)}
                placeholder="e.g. index.html"
                fullWidth
            />
            <Box sx={{
                flex: 1
            }}/>
            {filename && <Typography variant="body2">
                Your file will be saved as <span style={{
                    fontFamily: "'Overpass Mono', monospace",
                }}>{path}{filename}</span>
            </Typography>}
            <Box sx={{
                display: "flex",
                flexDirection: "row",
                gap: 2,
                alignItems: "center",
                justifyContent: "center",
                width: "100%",

                "& > *": {
                    width: "100%"
                }
            }}>
                <Button
                    onClick={() => {
                        setView("upload")
                    }}
                    color="secondary"
                    variant="contained"
                    disabled={!filename || buttonLoading}
                >
                    Upload File
                </Button>
                <LoadingButton
                    onClick={() => {
                        onCreation(filename)
                        setButtonLoading(true)
                    }}
                    color="primary"
                    variant="contained"
                    disabled={!filename}
                    loading={buttonLoading}
                >
                    Open in Editor
                </LoadingButton>
            </Box>
        </Box>

        <Box sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            alignItems: "start",
            justifyContent: "center"
        }}>
            <FilePicker onChange={(files) => {
                if(!files.length)return setFiles([])
                if(files.length !== 1)return toast.error("Please select one file only")
                setFiles(files)
            }} value={files}/>

            <LoadingButton
                onClick={async () => {
                    if(!files.length)return toast.error("Please select a file")
                    const file = files[0]
                    setButtonLoading(true)
                    const buffer = await file.arrayBuffer()
                    onCreation(filename, new Uint8Array(buffer))
                }}
                color="secondary"
                variant="contained"
                disabled={files.length !== 1}
                loading={buttonLoading}
                fullWidth
            >
                Upload File
            </LoadingButton>
        </Box>
    </SwipeableViews>
}