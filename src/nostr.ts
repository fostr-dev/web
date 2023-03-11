import { Event, getEventHash, nip05, signEvent, SimplePool } from "nostr-tools";
import { toast } from "react-hot-toast";
import AccountStore from "./stores/AccountStore";

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
export async function publishRevision(repository:string, dataLink: string){
    const event = {
        kind: 96,
        pubkey: AccountStore.publicKey,
        created_at: Math.floor(Date.now() / 1000),
        tags: [
            ["b", repository]
        ],
        content: dataLink
    } as any
    event.id = getEventHash(event)
    event.sig = signEvent(event, AccountStore.privateKey!.key)
    
    const pub = pool.publish(relays, event)
    return new Promise<Event>((resolve, reject) => {
        let responses = 0
        let publishedOnce = false
        pub.on("failed", (reason:string) => {
            toast.error(reason)
            responses++
            if(responses === relays.length){
                if(!publishedOnce){
                    reject()
                }else{
                    resolve(event)
                }
            }
        })
        pub.on("ok", () => {
            responses++
            publishedOnce = true
            if(responses === relays.length){
                resolve(event)
            }
        })
    })
}