import { nip19 } from "nostr-tools"

export function truncatePublicKey(publicKey:string):string | null{
    // npub+bech32 format
    if(publicKey.startsWith("npub")){
        return publicKey.slice(0, 14) + "..." + publicKey.slice(-10)
    }else if(/^[0-9a-f]{64}$/i.test(publicKey)){
        return truncatePublicKey(nip19.npubEncode(publicKey))
    }
    return null
}

export const VALIDE_FILE_URL_SCHEME = new Set([
    "ipfs:"
])

export const REPOSITORY_NAME_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
export function formatFileSize(size:number){
    if(size < 1024){
        return `${size}B`
    }else if(size < 1024 * 1024){
        return `${(size / 1024).toFixed(2)}KB`
    }else if(size < 1024 * 1024 * 1024){
        return `${(size / 1024 / 1024).toFixed(2)}MB`
    }else if(size < 1024 * 1024 * 1024 * 1024){
        return `${(size / 1024 / 1024 / 1024).toFixed(2)}GB`
    }else{
        return `${(size / 1024 / 1024 / 1024 / 1024).toFixed(2)}TB`
    }
}

export function getFileViewers(filePath:string){
    const lastPortion = filePath.split("/").pop()
    const ext = lastPortion?.split(".").pop()
    if(!ext || ext === lastPortion)return [
       ["text", "plaintext"]
    ]
    const viewers = []
    switch(ext){
        case "md":
            viewers.push(["markdown", "markdown"])
            viewers.push(["text", "markdown"])
            break
        case "json":
            viewers.push(["text", "json"])
            break
        case "html":
        case "qrc":
        case "in":
        case "plist":
        case "xml":
            viewers.push(["text", "xml"])
            break
        case "js":
            viewers.push(["text", "javascript"])
            break
        case "ts":
            viewers.push(["text", "typescript"])
            break
        case "css":
            viewers.push(["text", "css"])
            break
        case "scss":
            viewers.push(["text", "scss"])
            break
        case "less":
            viewers.push(["text", "less"])
            break
        case "py":
            viewers.push(["text", "python"])
            break
        case "go":
            viewers.push(["text", "go"])
            break
        case "rs":
            viewers.push(["text", "rust"])
            break
        case "java":
            viewers.push(["text", "java"])
            break
        case "c":
            viewers.push(["text", "c"])
            break
        case "cpp":
            viewers.push(["text", "cpp"])
            break
        case "sh":
            viewers.push(["text", "shell"])
            break
        case "yaml":
        case "yml":
            viewers.push(["text", "yaml"])
            break
        case "toml":
        case "conf":
        case "config":
        case "env":
            viewers.push(["text", "ini"])
            break
        case "svg":
            viewers.push(["image", "svg"])
            viewers.push(["text", "xml"])
            break
        case "png":
            viewers.push(["image", "png"])
            break
        case "jpg":
        case "jpeg":
            viewers.push(["image", "jpeg"])
            break
        case "gif":
            viewers.push(["image", "gif"])
            break
        case "webp":
            viewers.push(["image", "webp"])
            break
        case "ico":
            viewers.push(["image", "ico"])
            break
        case "mp4":
            viewers.push(["video", "mp4"])
            break
        case "webm":
            viewers.push(["video", "webm"])
            break
        case "mp3":
            viewers.push(["audio", "mp3"])
            break
        case "wav":
            viewers.push(["audio", "wav"])
            break
        case "ogg":
            viewers.push(["audio", "ogg"])
            break
        case "pdf":
            viewers.push(["pdf", "pdf"])
            break
        case "txt":
            viewers.push(["text", "plaintext"])
            break
        case "csv":
            viewers.push(["text", "csv"])
            break
        case "mdx":
            viewers.push(["text", "mdx"])
            break
        case "jsx":
            viewers.push(["text", "jsx"])
            break
        case "tsx":
            viewers.push(["text", "tsx"])
            break
        case "vue":
            viewers.push(["text", "vue"])
            break
        case "dart":
            viewers.push(["text", "dart"])
            break
        case "php":
            viewers.push(["text", "php"])
            break
        case "rb":
            viewers.push(["text", "ruby"])
            break
        case "swift":
            viewers.push(["text", "swift"])
            break
        case "kt":
            viewers.push(["text", "kotlin"])
            break
        case "sql":
            viewers.push(["text", "sql"])
            break
        case "hbs":
            viewers.push(["text", "hbs"])
            break
        case "svelte":
            viewers.push(["text", "svelte"])
            break
        case "t":
            viewers.push(["text", "t"])
            break
        case "vb":
            viewers.push(["text", "vb"])
            break
        case "sol":
            viewers.push(["text", "solidity"])
            break
        case "solpp":
            viewers.push(["text", "soliditypp"])
            break
    }
    if(!viewers.length){
        viewers.push(["text", "plaintext"])
    }
    return viewers
}