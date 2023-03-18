import { Box, TextField } from "@mui/material";

export default function Main(){
    return <Box sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "var(--app-height)",
        width: "40%",
        padding: 2
    }}>
        <TextField
            label="Search for an user"
        />
    </Box>
}