import { Add } from "@mui/icons-material";
import { AppBar, Box, Button, IconButton, Link, Toolbar } from "@mui/material";
import { useEffect, useState } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import useNip05 from "../hooks/useNip05";
import AccountStore from "../stores/AccountStore";
import { truncatePublicKey } from "../utils";

export default function NavBar() {
    const location = useLocation()
    const [navBarHeight, setNavBarHeight] = useState(0)
    const [appHeight, setAppHeight] = useState(window.innerHeight)
    const name = useNip05(AccountStore.publicKey ?? undefined)

    useEffect(() => {
        const appHeight = () => {
            setAppHeight(window.innerHeight)
        }
        window.addEventListener("resize", appHeight)
        appHeight()
        return () => {
            window.removeEventListener("resize", appHeight)
        }
    }, [])

    useEffect(() => {
        document.documentElement.style.setProperty("--app-height", `${appHeight - navBarHeight}px`)
    }, [appHeight, navBarHeight])

    return <AppBar position="sticky" sx={{
        background: "#000"
    }} ref={(appBar) => {
        setNavBarHeight(appBar?.clientHeight ?? 0)
    }}>
        <Toolbar sx={{
            gap: 1,
            alignItems: "center"
        }}>
            <Link component={RouterLink} to="/">
                <Button>
                    <img src={"/favicon.png"} draggable={false} style={{
                        height: 48,
                    }}/>
                </Button>
            </Link>

            <Box sx={{
                flexGrow: 1
            }} />

            <Link component={RouterLink} to="/new">
                <IconButton>
                    <Add/>
                </IconButton>
            </Link>

            {AccountStore.privateKey ? <Link
                component={RouterLink}
                to="/account"
            >
                <Button
                    variant="contained"
                    sx={{
                        textTransform: "none",
                        fontFamily: "'Overpass Mono', monospace"
                    }}
                >
                    {name || truncatePublicKey(AccountStore.publicKey!)}
                </Button>
            </Link> : <Link
                component={RouterLink}
                to="/login"
                state={{
                    redirect: location.pathname
                }}
            >
                <Button variant="contained">
                    Login
                </Button>
            </Link>}
        </Toolbar>
    </AppBar>
}