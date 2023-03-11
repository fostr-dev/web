import { Box, Button, Link, Typography } from "@mui/material"
import { Fragment } from "react"
import { Link as RouterLink, useLocation } from "react-router-dom"

export default function ErrorPage({
    title,
    reason,
    showLogin = false
}:{
    title: string
    reason: string
    showLogin?: boolean
}){
    const location = useLocation()
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
            {reason.split("\n").map((line, i) => <Fragment key={i}>{line}<br/></Fragment>)}
        </Typography>

        {showLogin && <Link
            to="/login"
            component={RouterLink}
            state={{redirect: location.pathname}}
        >
            <Button variant="contained" color="primary">
                Login
            </Button>
        </Link>}
    </Box>
}