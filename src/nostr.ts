import { Event, getEventHash, nip05, signEvent, SimplePool } from "nostr-tools";
import { toast } from "react-hot-toast";
import AccountStore from "./stores/AccountStore";
import RelayStore from "./stores/RelayStore";

export const pool = new SimplePool({ getTimeout: 3000 })

export async function fetchEventsByAuthor(author: string) {
    const events = await pool.list(RelayStore.relays, [
        {
            kinds: [96],
            authors: [author],
        }
    ])
    return events
}
export async function fetchEventsByAuthorAndRepository(author: string, repository: string) {
    const events = await pool.list(RelayStore.relays, [
        {
            kinds: [96],
            authors: [author],
            "#b": [repository],
        }
    ])
    return events
}
export async function fetchEventsByRepository(owner: string, repository: string) {
    const events = await pool.list(RelayStore.relays, [
        {   
            kinds: [96],
            "#b": [repository],
            "#p": [owner],
        }
    ])
    return events
}
export async function fetchEventsByIssue(owner: string, repository: string, issue: string) {
    const events = await pool.list(RelayStore.relays, [
        {
            kinds: [96],
            "#b": [repository],
            "#p": [owner],
            "#e": [issue],
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
    const event = await pool.get(RelayStore.relays, {
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

export async function publishEvent(event: Event){
    event.id = getEventHash(event)
    event.sig = signEvent(event, AccountStore.privateKey!.key)
    console.log(JSON.stringify(event, null, 4))
    
    const relays = RelayStore.relays
    const pub = pool.publish(relays, event)
    return new Promise<Event>((resolve, reject) => {
        let responses = 0
        let publishedOnce = false
        pub.on("failed", (relay:string) => {
            toast.error(`Publishing event to ${relay} failed!`)
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
            resolve(event)
        })
    })
}
export async function createIssue(owner:string, repository:string, title:string, content:string){
    const event = {
        kind: 96,
        pubkey: AccountStore.publicKey,
        created_at: Math.floor(Date.now() / 1000),
        tags: [
            ["b", repository],
            ["p", owner],
            ["c", title]
        ],
        content
    } as any
    return publishEvent(event)
}
export async function createPullRequest(owner:string, repository:string, title:string, content:string){
    const event = {
        kind: 96,
        pubkey: AccountStore.publicKey,
        created_at: Math.floor(Date.now() / 1000),
        tags: [
            ["b", repository],
            ["p", owner],
            ["m", title]
        ],
        content
    } as any
    return publishEvent(event)
}
export async function replyToIssue(owner:string, repository:string, issue:string, content:string){
    const event = {
        kind: 96,
        pubkey: AccountStore.publicKey,
        created_at: Math.floor(Date.now() / 1000),
        tags: [
            ["b", repository],
            ["p", owner],
            ["e", issue]
        ],
        content
    } as any
    return publishEvent(event)
}
export async function publishRevision(repository:string, dataLink: string, message?: string){
    const event = {
        kind: 96,
        pubkey: AccountStore.publicKey,
        created_at: Math.floor(Date.now() / 1000),
        tags: [
            ["b", repository],
            ...(message ? [["t", message]] : [])
        ],
        content: dataLink
    } as any
    return publishEvent(event)
}
