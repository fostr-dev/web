import { create } from "ipfs-http-client"

export const IPFS_URL = "https://dweb.link"

export default create({
    url: IPFS_URL+"/api/v0"
})