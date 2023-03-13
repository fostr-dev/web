import { useEffect } from "react";

export default function usePreventExit(message:string){
    useEffect(() => {
        const listener = () => {
            return message
        }
        window.addEventListener("beforeunload", listener)
        return () => {
            window.removeEventListener("beforeunload", listener)
        }
    }, [message])
}