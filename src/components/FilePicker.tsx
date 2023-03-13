import { Close, FileUpload, Folder, InsertDriveFileOutlined } from "@mui/icons-material"
import { Box, CircularProgress, IconButton, Typography } from "@mui/material"
import { useState } from "react"

export default function FilePicker(
    {
        value,
        onChange,
        disabled = false
    }:{
        value: File[]
        onChange: (value: File[]) => void,
        disabled?: boolean
    }
){
    const [dragging, setDragging] = useState(false)
    const [loading, setLoading] = useState(false)
    
    return <>
        <Box
            className={disabled ? "disabled" : ""}
            sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                padding: 2,
                alignItems: "center",
                justifyContent: "center",
                minHeight: 300,
                width: "100%",
                textAlign: "center",
                border: "2px dashed",
                color: disabled ? "#3c3c3c" : dragging ? "primary.main" : "text.secondary",
                borderColor: disabled ? "#3c3c3c" : dragging ? "primary.main" : "text.secondary",
                backgroundColor: dragging && !disabled ? "rgba(0, 0, 0, 0.2)" : "transparent",
                borderRadius: 2,
                transition: "border-color 0.2s ease-in-out, background-color 0.2s ease-in-out, color 0.2s ease-in-out",
                "&:hover:not(.disabled)": {
                    borderColor: "primary.main",
                    color: "primary.main",
                    backgroundColor: "rgba(0, 0, 0, 0.2)"
                },
                cursor: disabled ? "inherit" : "pointer"
            }}
            onDragEnter={() => setDragging(true)}
            onDragLeave={() => setDragging(false)}
            onDragOver={(e) => {
                e.preventDefault()
                e.stopPropagation()
            }}
            onDrop={async (e) => {
                if(disabled)return
                e.preventDefault()
                e.stopPropagation()
                setDragging(false)
                setLoading(true)
                const files:File[] = []
                const addDirectory = async (entry: FileSystemDirectoryEntry, base:string) => {
                    const reader = entry.createReader()
                    const entries = await new Promise<FileSystemEntry[]>((resolve, reject) => {
                        reader.readEntries(resolve, reject)
                    })
                    for(const entry of entries){
                        if(entry.isFile){
                            const file = await new Promise<File>((resolve, reject) => {
                                (entry as FileSystemFileEntry).file(resolve, reject)
                            })
                            const newfile = new File([file], base + file.name, {type: file.type})
                            files.push(newfile)
                        }else if(entry.isDirectory){
                            const folder = base + entry.name + "/"
                            files.push(new File([], folder))
                            await addDirectory(entry as FileSystemDirectoryEntry, folder)
                        }
                    }
                }
                for(const item of e.dataTransfer.items){
                    const entry = item.webkitGetAsEntry()
                    if(!entry)continue
                    if(entry.isFile){
                        const file = await new Promise<File>((resolve, reject) => {
                            (entry as FileSystemFileEntry).file(resolve, reject)
                        })
                        const newfile = new File([file], "/" + file.name, {type: file.type})
                        files.push(newfile)
                    }else if(entry.isDirectory){
                        await addDirectory(entry as FileSystemDirectoryEntry, "/")
                    }
                }
                setLoading(false)
                onChange(files)
            }}
            onClick={() => {
                if(disabled)return
                const input = document.createElement("input")
                input.type = "file"
                input.multiple = true

                input.addEventListener("change", () => {
                    if(disabled)return
                    const files = Array.from(input.files ?? [])
                    console.log(files)
                    onChange(files.map(file => new File([file], "/"+file.name, {type: file.type})))
                })

                input.click()
            }}
        >
            {loading ? <CircularProgress /> : <><FileUpload /> Drop a folder or file here or click to select</>}
        </Box>

        <Box sx={{
            textAlign: "start",
        }}>
            {value.map(file => {
                const isDirectory = file.name.endsWith("/")
                const parts = file.name.slice(1, isDirectory?-1:undefined).split("/")
                const filename = parts[parts.length-1]
                return <Box key={file.name} sx={{
                    display: "flex",
                    flexDirection: "row",
                    gap: 2,
                    alignItems: "center"
                }}>
                    <IconButton
                        onClick={() => {
                            let files = value.filter(f => f !== file)
                            if(isDirectory){
                                const folder = file.name
                                files = files.filter(f => !f.name.startsWith(folder))
                            }
                            onChange(files)
                        }}
                        disabled={disabled}
                    >
                        <Close />
                    </IconButton>

                    <Box sx={{
                        paddingLeft: (parts.length - 1) * 2,
                    }}>
                        {isDirectory ? <Folder/> : <InsertDriveFileOutlined/>}
                    </Box>
                    
                    <Typography sx={{
                        fontFamily: "'Overpass Mono', monospace",
                    }}>{filename}</Typography>
                </Box>
            })}
        </Box>
    </>
}