import { appEvents } from "../events"

export default new class RelayStore {
    defaultRelays = [
        "wss://brb.io",
        "wss://eden.nostr.land",
        "wss://relay.damus.io",
        "wss://nostr.adpo.co",
        "wss://nos.lol",
        "wss://relay.nostr.band",
        "wss://offchain.pub"
    ]

    get relays(): string[] {
        try{
            const relays = JSON.parse(localStorage.getItem("relays")!)
            if(!relays || relays.length === 0)return this.defaultRelays
            return relays
        }catch(err){
            console.error(err)
            return this.defaultRelays
        }
    }

    set relays(relays: string[]) {
        localStorage.setItem("relays", JSON.stringify(relays))
        appEvents.emit("RelayStore:change")
    }
}