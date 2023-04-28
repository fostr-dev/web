import { useEffect } from "react";
import useRefresh from "./useRefresh";
import { appEvents } from "../events";

export default function useAppEvent<key extends keyof typeof appEvents.definition>(key:Exclude<key, number>, filter?:(...args:typeof appEvents.definition[key]) => boolean){
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, refresh] = useRefresh()

    useEffect(() => {
        const listener = (...args:typeof appEvents.definition[key]) => {
            if(filter && !filter(...args)){
                return
            }
            refresh()
        }
        appEvents.on(key, listener)
        return () => {
            appEvents.off(key, listener)
        }
    }, [])
}