import { Box, Button, Divider, TextField, Typography } from "@mui/material";
import AccountStore from "../stores/AccountStore";
import useAppEvent from "../hooks/useAppEvent";
import RelayStore from "../stores/RelayStore";
import { useMemo, useState } from "react";

export default function SettingsModal(){
    const defaultRelayText = useMemo(() => {
        return RelayStore.relays.join("\n")
    }, [RelayStore.relays])
    const [relaysText, setRelaysText] = useState(defaultRelayText)
    useAppEvent("AccountStore:change")
    useAppEvent("RelayStore:change")
    const error = useMemo(() => {
        const relays = relaysText.split("\n")
            .map(relay => relay.trim())
            .filter(relay => !!relay)
        if(relays.length === 0){
            return "You must have at least one relay"
        }
        for(const relay of relays){
            try{
                const url = new URL(relay)
                if(!/^wss?:$/.test(url.protocol)){
                    return `Invalid protocol: ${url.protocol} for relay ${relay}`
                }
            }catch(e){
                return `Invalid relay: ${relay}`
            }
        }
        return ""
    }, [relaysText])


    return <Box sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2
    }}>
        <Typography variant="h4">
            Settings
        </Typography>
        <Divider />
        <Typography variant="h6">
            Relays
        </Typography>
        <Typography variant="subtitle2">
            Put one relay url per line
        </Typography>
        <TextField
            value={relaysText}
            onChange={(e) => {
                setRelaysText(e.target.value)
            }}
            multiline
            fullWidth
            variant="outlined"
            error={!!error}
            helperText={error}
        />
        <Box sx={{
            display: "flex",
            flexDirection: "row",
            gap: 2,

            "& > *": {
                flex: 1
            }
        }}>
            <Button
                variant="outlined"
                onClick={() => {
                    RelayStore.relays = relaysText.split("\n")
                        .map(relay => relay.trim())
                        .filter(relay => !!relay)
                }}
                disabled={
                    relaysText === defaultRelayText || !!error
                }
            >
                Save
            </Button>
            <Button
                variant="outlined"
                onClick={() => {
                    RelayStore.relays = RelayStore.defaultRelays
                    setRelaysText(RelayStore.defaultRelays.join("\n"))
                }}
            >
                Reset
            </Button>
        </Box>
        {AccountStore.publicKey && <>
            <Divider />
            <Button
                variant="outlined"
                color="error"
                onClick={() => {
                    AccountStore.privateKey = null
                }}
            >
                Logout
            </Button>
        </>}
    </Box>
}