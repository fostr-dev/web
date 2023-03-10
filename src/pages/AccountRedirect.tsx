import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import AccountStore from "../stores/AccountStore"
import ErrorPage from "./ErrorPage"

export default function AccountRedirect(){
    const account = AccountStore.publicKey
    const navigate = useNavigate()

    useEffect(() => {
        if(account){
            navigate(`/${account}`)
        }
    }, [account])

    if(!account)return <ErrorPage
        title="You are not logged in"
        reason="You need to be logged in to view your account"
    />

    return null
}