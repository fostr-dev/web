import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import AccountStore from "../stores/AccountStore"
import ErrorPage from "./ErrorPage"
import useAppEvent from "../hooks/useAppEvent"

export default function AccountRedirect(){
    const account = AccountStore.publicKey
    const navigate = useNavigate()
    useAppEvent("AccountStore:change")

    useEffect(() => {
        if(account){
            navigate(`/${account}`)
        }
    }, [account])

    if(!account)return <ErrorPage
        title="You are not logged in"
        reason="You need to be logged in to view your account"
        showLogin
    />

    return null
}