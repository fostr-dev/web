import { useEffect } from "react"

const appTitle = "Fostr"
const defaultTitle = document.title
export default function useTitle(title: string) {
    useEffect(() => {
        document.title = title ? `${title} - ${appTitle}` : defaultTitle
        return () => {
            document.title = defaultTitle
        }
    }, [title])
}