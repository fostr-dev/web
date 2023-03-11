import { Box, ThemeProvider, CssBaseline } from "@mui/material"
import { HashRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import NavBar from "./components/NavBar";
import dark from "./themes/dark";
import Login from "./pages/Login";
import Repository from "./pages/Repository";
import Account from "./pages/Account";
import AccountRedirect from "./pages/AccountRedirect";
import NewRepository from "./pages/NewRepository";

function App() {
    return <ThemeProvider theme={dark}>
        <CssBaseline />
        <Box sx={{
            minHeight: "var(--window-height)"
        }} bgcolor="background">
            <Toaster position="bottom-center" toastOptions={{
                duration: 5000,
                style: {
                    background: "#333",
                    color: "#fff",
                }
            }}/>
            <HashRouter>
                <NavBar/>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/account" element={<AccountRedirect />} />
                    <Route path="/new" element={<NewRepository />} />

                    <Route path="/:owner/:name" element={<Repository />} />
                    <Route path="/:account" element={<Account />} />
                </Routes>
            </HashRouter>
        </Box>
    </ThemeProvider>
}

export default App