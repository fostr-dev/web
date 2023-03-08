import { create } from "ipfs-http-client"

export const IPFS_URL = "https://node-ipfs.thomiz.dev"

export default create({
    url: IPFS_URL+"/api/v0"
})