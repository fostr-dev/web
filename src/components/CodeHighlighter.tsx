import { useEffect, useState } from "react";
import "highlight.js/scss/stackoverflow-dark.scss"
import { HLJSApi } from "highlight.js";
import { toast } from "react-hot-toast";
import { CircularProgress } from "@mui/material";

const registerMap = new Map()
const languages = import.meta.glob("/node_modules/highlight.js/es/languages/[^\\.]+.js")
for(const key in languages){
    const name = key.split("/").pop()?.split(".").shift() as string
    languages[name] = languages[key]
    delete languages[key]
}
export function CodeHighlighter({
    code,
    language
}:{
    code: string,
    language: string
}){
    const [highlightJS, setHighlightJS] = useState<HLJSApi|null>(null)
    useEffect(() => {
        setHighlightJS(null)
        Promise.all([
            import("highlight.js/lib/core"),
            (() => {
                switch(language){
                    case "soliditypp":
                        return import("highlightjs-soliditypp" as any)
                    case "solidity":
                        return import("highlightjs-solidity" as any)
                    default:
                        return languages[language]?.() as any
                }
            })()
        ])
        .then(([
            highlightJS,
            lib
        ]) => {
            if(!lib)throw new Error("Language not found: "+language)
            if(!registerMap.get(language)){
                registerMap.set(language, true)
                switch(language){
                    case "soliditypp":
                    case "solidity":
                        lib.default(highlightJS.default)
                        break
                    default:
                        highlightJS.default.registerLanguage(language, lib.default)
                }
            }
            setHighlightJS(highlightJS.default)
        }).catch(err => {
            toast.error(err.message)
        })
    }, [language])

    if(!highlightJS)return <pre style={{
        textAlign: "left",
        fontSize: 13,
        margin: 0
    }}>
        <code className={"language-"+language}>
            <CircularProgress />
        </code>
    </pre>

    return <pre style={{
        textAlign: "left",
        fontSize: 13,
        margin: 0
    }}>
        <code ref={el => {
            if(!el)return
            highlightJS.highlightElement(el)
        }} className={"language-"+language}>
            {code}
        </code>
    </pre>
}