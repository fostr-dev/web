import { Box, Typography } from "@mui/material"

export default function ErrorPage({
    title,
    reason
}:{
    title: string
    reason: string
}){
    return <Box sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        padding: 2,
        alignItems: "center",
        justifyContent: "center",
        height: "var(--app-height)",
        width: "100%",
        textAlign: "center"
    }}>
        <Typography variant="h4" fontWeight="bolder">
            {title}
        </Typography>
        <Typography variant="body1">
            {reason}
        </Typography>
    </Box>
}