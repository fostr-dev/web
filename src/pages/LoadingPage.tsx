import { Box, CircularProgress } from "@mui/material";

export default function LoadingPage(){
    return <Box sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "var(--app-height)",
        width: "100%",
        padding: 2
    }}>
        <CircularProgress/>
    </Box>
}