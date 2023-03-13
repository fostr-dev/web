import { getProfileInfo, validateNip05 } from "../nostr"
import usePromise from "./usePromise"

export default function useNip05(address: string|undefined) {
    const [
        ,
        nip05
    ] = usePromise(async () => {
        if(!address)return null

        const profile = await getProfileInfo(address)
        if(!profile.nip05)return null
        
        const valid = await validateNip05(address, profile.nip05)
        if(!valid)return null

        return profile.nip05
    }, [address])

    return nip05
}