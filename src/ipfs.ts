import { CID, create, IPFSHTTPClient } from "ipfs-http-client"

export const IPFS_URL = "https://node-ipfs.thomiz.dev"
export const EMPTY_DIRECTORY_IPFS_CID = "QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn"
export const EMPTY_FILE_IPFS_CID = "QmbFMke1KXqnYyBBWxB74N4c5SBnJMVAiMNRcGu6x1AwQH"

export default create({
    url: "https://node-ipfs.thomiz.dev/5001/api/v0",
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

function typeOf(link: any) {
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

export async function makeTree(root_hash:string, path:string){
    const tree = {
        "/": root_hash
    } as Record<string, string>
    // build parents tree
    const p = path.split("/")
    for(let i = 1; i < p.length; i++){
        // loop over the path, to create the parents tree
        const p2 = p.slice(0, i + 1).join("/") || "/"
        const p1 = p.slice(0, i).join("/") || "/"
        if(p2 === path)break
        if(!p2)continue

        const parent_cid = tree[p1]

        const results = await ls(parent_cid)
        const dir = results.find((e:any) => e.name === p[i])
        tree[p2] = dir?.cid
    }
    return tree
}
export async function updateTree(ipfs:IPFSHTTPClient, tree:Record<string, string>, path:string){
    const p = path.split("/")
    for(let i = p.length-1; i >= 0; i--){
        // reverse loop over the path, to modify the tree from the modified file
        const p2 = p.slice(0, i + 1).join("/") || "/"
        const p1 = p.slice(0, i).join("/") || "/"
        if(!p2)continue
        if(p2 === "/")break
        const child_cid = tree[p2]
        const parent_cid = tree[p1]

        const result = await ipfs.object.patch.addLink(
            CID.parse(parent_cid)!,
            {
                Name: p[i],
                Hash: CID.parse(child_cid)
            }
        )
        tree[p1] = result.toString()
    }
    return tree["/"]
}