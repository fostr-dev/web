import { Box, Link } from "@mui/material"
import { CodeHighlighter } from "./CodeHighlighter"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

export default function Markdown({
    document
}:{
    document: string
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
                }
            }}
            remarkPlugins={[remarkGfm]}
        >
            {document}
        </ReactMarkdown>
    </Box>
}