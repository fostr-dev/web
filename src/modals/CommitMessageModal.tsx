import { Box, Button, TextField, Typography } from "@mui/material"
import { useState } from "react"

export default function CommitMessageModal({
    onCloseWithoutMessage: onClose,
    onCommit,
    onCancel
}:{
    onCloseWithoutMessage: () => void
    onCommit: (message: string) => void
    onCancel: () => void
}){
    const [message, setMessage] = useState("")
    return <Box sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        alignItems: "center",
        justifyContent: "center"
    }}>
        <Typography variant="h4" fontWeight="bolder">
            Commit Message
        </Typography>
        <TextField
            label="Commit Message"
            value={message}
            onChange={e => setMessage(e.target.value)}
            fullWidth
        />
        <Button
            onClick={() => {
                onCommit(message)
            }}
            color="secondary"
            variant="contained"
            disabled={!message}
            fullWidth
        >
            Commit
        </Button>
        <Typography variant="body2" sx={{
            marginTop: 5
        }}>
            OR
        </Typography>
        <Button
            onClick={() => {
                onClose()
            }}
            color="primary"
            variant="contained"
            fullWidth
        >
            Commit Without Message
        </Button>
        <Button
            onClick={() => {
                onCancel()
            }}
            color="error"
            variant="outlined"
            fullWidth
        >
            Cancel
        </Button>
    </Box>
}