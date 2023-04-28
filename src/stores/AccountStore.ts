import { getPublicKey } from "nostr-tools"
import { appEvents } from "../events"

export interface AccountPrivatekey {
    key: string,
    v: number,
}

export default new class AccountStore {
    get privateKey(): AccountPrivatekey | null {
        try{
            return JSON.parse(localStorage.getItem("privateKey")!)
        }catch(err){
            console.error(err)
            return null
        }
    }

    set privateKey(privateKey: AccountPrivatekey | null) {
        localStorage.setItem("privateKey", JSON.stringify(privateKey))
        appEvents.emit("AccountStore:change")
    }

    get publicKey(): string | null {
        const privateKey = this.privateKey
        if(!privateKey)return null
        
        switch(privateKey.v){
            case 0:
                return getPublicKey(privateKey.key)
            default:
                return null
        }
    }
}