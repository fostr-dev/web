import { createTheme } from "@mui/material";

//const { palette: { augmentColor } } = createTheme()

export default createTheme({
    palette: {
        mode: "dark",
        //black: augmentColor({ color: { main: "#000000" } })
        background: {
            default: "#000000",
        }
    }
})