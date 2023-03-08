import { nip05, SimplePool } from "nostr-tools";

export const pool = new SimplePool()
export const relays = ["wss://nostr-dev.newstr.io","wss://nostr.adpo.co","wss://nos.lol","wss://relay.nostr.band"]

export async function fetchEventsByAuthor(author: string) {
    const events = await pool.list(relays, [
        {
            kinds: [96],
            authors: [author],
        }
    ])
    return events
}
export async function fetchEventsByAuthorAndRepository(author: string, repository: string) {
    const events = await pool.list(relays, [
        {
            kinds: [96],
            authors: [author],
            "#b": [repository],
        }
    ])
    return events
}
export interface ProfileInfo {
    name?: string,
    picture?: string,
    display_name?: string,
    about?: string,
    website?: string,
    nip05?: string
}
export async function getProfileInfo(pubkey: string): Promise<ProfileInfo> {
    const event = await pool.get(relays, {
        kinds: [0],
        authors: [pubkey],
    })
    if(!event)return {}
    try{
        const content:ProfileInfo = JSON.parse(event.content)
        const c = content as any
        for(const key in content){
            if(typeof c[key] !== "string"){
                delete c[key]
            }
        }
        return content
    }catch{
        return {}
    }
}
export async function validateNip05(pubkey:string, name:string):Promise<boolean>{
    const profile = await nip05.queryProfile(name)
    if(!profile)return false
    return profile.pubkey === pubkey
}