import { LoadingButton } from "@mui/lab";
import { Box, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";

export default function RepositoryIssueEditor({
    allowTitle = false,
    refreshId = 0,
    onSubmit
}:{
    allowTitle?: boolean,
    refreshId?: number,
    onSubmit: (title: string, content: string) => void
}){
    const [title, setTitle] = useState("")
    const [content, setContent] = useState("")
    const [loading, setLoading] = useState(false)
    useEffect(() => {
        setTitle("")
        setContent("")
        setLoading(false)
    }, [refreshId])
    return <Box sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 2,
        alignItems: "center"
    }}>
        <Typography variant="h6">
            {allowTitle ? "Create Issue" : "Submit Comment"}
        </Typography>
        {allowTitle && <TextField
            label="Issue Title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            fullWidth
            disabled={loading}
        />}

        <TextField
            label={allowTitle ? "Content" : "Comment"}
            multiline
            rows={6}
            maxRows={Infinity}
            value={content}
            onChange={e => setContent(e.target.value)}
            fullWidth
            size="small"
            disabled={loading}
        />
        
        <LoadingButton
            variant="contained"
            color="primary"
            fullWidth
            disabled={!content || (allowTitle && !title)}
            loading={loading}
            onClick={() => {
                setLoading(true)
                onSubmit?.(title, content)
            }}
        >
            {allowTitle ? "Create Issue" : "Comment"}
        </LoadingButton>
    </Box>
}