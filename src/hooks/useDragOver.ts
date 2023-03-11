import { DependencyList, useEffect } from "react";

export default function useDragOver(callback: (dragging:boolean) => void, deps: DependencyList = []){
    useEffect(() => {
        const onDragOver = (e: DragEvent) => {
            e.preventDefault()
            callback(true)
        }
        const onDragLeave = (e: DragEvent) => {
            e.preventDefault()
            callback(false)
        }
        window.addEventListener("dragover", onDragOver)
        window.addEventListener("dragleave", onDragLeave)
        return () => {
            window.removeEventListener("dragover", onDragOver)
            window.removeEventListener("dragleave", onDragLeave)
        }
    }, deps)
}