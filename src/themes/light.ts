import { createTheme/*, PaletteColorOptions*/ } from "@mui/material";

/*declare module "@mui/material/styles" {
    interface CustomPalette {
        black: PaletteColorOptions;
        white: PaletteColorOptions;
    }
    type Palette = CustomPalette
    type PaletteOptions = CustomPalette
}
  
declare module "@mui/material/Button" {
    interface ButtonPropsColorOverrides {
        black: true;
        white: true;
    }
}
declare module "@mui/material/CircularProgress" {
    interface CircularProgressPropsColorOverrides {
        black: true;
        white: true;
    }
}

const { palette: { augmentColor } } = createTheme()*/

export default createTheme({
    palette: {
        mode: "light",
        // black: augmentColor({ color: { main: "#000000" } }),
        // white: augmentColor({ color: { main: "#ffffff" } }),
    }
})