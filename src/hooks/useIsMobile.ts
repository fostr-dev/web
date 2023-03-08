import React from "react"

export default function useIsMobile(){
    const [isMobile, setMobile] = React.useState(window.innerWidth < 810)

    React.useEffect(() => {
        const listener = () => {
            setMobile(window.innerWidth < 810)
        }
        window.addEventListener("resize", listener)
        return () => {
            window.removeEventListener("resize", listener)
        }
    }, [])

    return isMobile
}