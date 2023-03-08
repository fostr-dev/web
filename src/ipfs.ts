import { create } from "ipfs-http-client"

export const IPFS_URL = "https://dweb.link/api/v0"

export default create({
    url: IPFS_URL
})