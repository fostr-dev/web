import { Box, Link } from "@mui/material"
import { CodeHighlighter } from "./CodeHighlighter"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"
import rehypeKatex from "rehype-katex"
import rehypeSanitize from "rehype-sanitize"
import rehypeRaw from "rehype-raw"

import "katex/dist/katex.min.css"

export default function Markdown({
    document,
    relative_path
}:{
    document: string,
    relative_path: string
}){
    return <Box sx={{
        "pre > pre": {
            margin: 0
        }
    }}>
        <ReactMarkdown
            components={{
                code({inline, className, children}) {
                    const match = /language-(\w+)/.exec(className || "")
                    return !inline && match ? <CodeHighlighter
                        code={String(children).replace(/\n$/, "")}
                        language={match[1]}
                    /> : <CodeHighlighter
                        code={String(children).replace(/\n$/, "")}
                        language="plaintext"
                    />
                },
                a({href, children}){
                    return <Link
                        href={href}
                        target="_blank"
                        rel="noreferrer"
                    >
                        {children}
                    </Link>
                },
                img({src, alt}){
                    if(!src){
                        return null
                    }
                    try{
                        new URL(src!)
                        return <img
                            src={`https://media-proxy.jeanouina.workers.dev/?url=${encodeURIComponent(src)}`}
                            alt={alt}
                        />
                    }catch{
                        // we might have a relative path
                        return <img
                            src={`${relative_path}/${src.replace(/^\.?\//, "")}`}
                            alt={alt}
                        />
                    }
                }
            }}
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeKatex, rehypeRaw, rehypeSanitize]}
        >
            {document}
        </ReactMarkdown>
    </Box>
}