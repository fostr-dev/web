import { Box, Button, Card, Checkbox, FormControlLabel, TextField, Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { nip19, generatePrivateKey/*, getPublicKey, getEventHash, signEvent*/ } from "nostr-tools";
import { useLocation, useNavigate } from "react-router-dom";
import AccountStore from "../stores/AccountStore";
import SwipeableViews from "react-swipeable-views";
import CopyTextField from "../components/CopyTextField";
import useTitle from "../hooks/useTitle";
//import { pool, relays } from "../nostr";

export default function Login(){
    useTitle("Login")
    const location = useLocation()
    const navigate = useNavigate()
    const [privateKey, setPrivateKey] = useState("")
    const privateKeyError = useMemo(() => {
        if(!privateKey) return "No private key provided"
        if(/^[abcdef\d]{64}$/.test(privateKey)) return null
        try{
            const { type } = nip19.decode(privateKey)
            if(type !== "nsec"){
                return `NIP-19 ${type} keys are not supported`
            }
            return null
        }catch(err){
            return (err as any).message ?? "Invalid private key"
        }
    }, [privateKey])
    const [view, setView] = useState<"login" | "create">("login")
    const viewIndex = useMemo(() => {
        return ["login", "create"].indexOf(view)
    }, [view])
    const [backedUp, setBackedUp] = useState(false)
    useEffect(() => {
        if(AccountStore.privateKey){
            navigate(location.state?.redirect ?? "/")
        }
    }, [])


    return <Box sx={{
        minHeight: "var(--app-height)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",

        ".card-group": {
            display: "flex",
            flexDirection: "row",
            gap: 2,
            padding: 2,
            justifyContent: "center",
            flexWrap: "wrap",
            width: "100%",

            "& > *": {
                width: "100%",
                maxWidth: 600,
                padding: 2,
                display: "flex",
                flexDirection: "column",
                gap: 2,
                alignItems: "center",
                textAlign: "center",

                "& > *": {
                    width: "100%"
                }
            }
        }
    }}>
        <SwipeableViews
            index={viewIndex}
            style={{
                width: "100%"
            }}
        >
            <Box className="card-group">
                <Card elevation={0}>
                    <Typography variant="h4" fontWeight="bolder">
                        Welcome Back!
                    </Typography>
                    <Typography variant="body1">
                        Login to your account to continue.
                    </Typography>
                    
                    <TextField
                        label="Private Key"
                        value={privateKey}
                        onChange={(e) => setPrivateKey(e.target.value?.toLowerCase() ?? "")}
                        error={!!privateKey && !!privateKeyError}
                        helperText={privateKey && privateKeyError}
                    />

                    <Button
                        disabled={!privateKey || !!privateKeyError}
                        variant="outlined"
                        onClick={() => {
                            let data = privateKey
                            if(privateKey.startsWith("nsec")){
                                data = nip19.decode(privateKey).data.toString()
                            }
                            AccountStore.privateKey = {
                                v: 0,
                                key: data
                            }
                            navigate(location.state?.redirect ?? "/account")

                            /*const event = {
                                kind: 96,
                                pubkey: getPublicKey(data),
                                created_at: Math.floor(Date.now() / 1000),
                                tags: [
                                    ["b", "tornado-cash"]
                                ],
                                content: "ipfs://QmU3j1B1UagFbfqgwWBu3yk1La657y8hoGoA24fG3QpPjf",
                            } as any
                            event.id = getEventHash(event)
                            event.sig = signEvent(event, data)
                            
                            pool.publish(relays, event)
                            console.log(event)*/
                        }}
                    >
                        Login
                    </Button>
                </Card>

                <Card elevation={0}>
                    <Typography variant="h4" fontWeight="bolder">
                        No Account?
                    </Typography>
                    <Typography variant="body1">
                        Create an account to get started.
                    </Typography>
                    
                    <Box sx={{
                        flex: 1
                    }} />

                    <Button
                        variant="outlined"
                        onClick={() => {
                            setView("create")

                            setPrivateKey(nip19.nsecEncode(generatePrivateKey()).toString())
                        }}
                    >
                        Create Account
                    </Button>
                </Card>
            </Box>

            <Box className="card-group">
                <Card elevation={0}>
                    <Typography variant="h4" fontWeight="bolder">
                        New Account
                    </Typography>
                    <Typography variant="body1">
                        Save the private key somewhere secure, you will need it to login. Anyone with this key can access your account. ⚠️ 
                    </Typography>

                    <CopyTextField
                        value={privateKey}
                        label="Private Key"
                    />
                    
                    <Box sx={{
                        flex: 1
                    }} />

                    <FormControlLabel
                        control={<Checkbox
                            checked={backedUp}
                            onChange={(e) => setBackedUp(e.target.checked)}
                        />}
                        label="I have saved my private key somewhere secure"
                        labelPlacement="end"
                    />
                    <Button
                        variant="outlined"
                        onClick={() => {
                            const { data } = nip19.decode(privateKey)
                            AccountStore.privateKey = {
                                v: 0,
                                key: data.toString()
                            }
                            navigate(location.state?.redirect ?? "/account")
                        }}
                        disabled={!backedUp}
                    >
                        Create Account
                    </Button>
                </Card>
            </Box>
        </SwipeableViews>
    </Box>
}