import { DependencyList, useEffect } from "react"

export default function useDragAndDrop(callback: (files: File[]) => void, deps: DependencyList = []) {
    useEffect(() => {
        const onDrop = (e: DragEvent) => {
            e.preventDefault()
            callback([...(e.dataTransfer?.files || [])])
        }
        window.addEventListener("drop", onDrop)
        return () => {
            window.removeEventListener("drop", onDrop)
        }
    }, deps)
}