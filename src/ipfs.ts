import { create } from "ipfs-http-client"

export const IPFS_URL = "https://node-ipfs.thomiz.dev"
export const EMPTY_DIRECTORY_IPFS_CID = "QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn"

export default create({
    url: IPFS_URL+"/api/v0"
})

export async function ls(cid: string) {
    // don't use ipfs.ls, because stat calls on empty directories are not supported
    const res = await fetch(IPFS_URL + "/api/v0/ls?arg=" + encodeURIComponent(cid))
    const res_1 = await res.json()
    return res_1.Objects[0].Links.map((link: any) => {
        return {
            name: link.Name,
            cid: link.Hash,
            size: link.Size,
            type: typeOf(link)
        }
    })
}

function typeOf (link:any) {
    switch (link.Type) {
      case 1:
      case 5:
        return "dir"
      case 2:
        return "file"
      default:
        return "file"
    }
  }
  