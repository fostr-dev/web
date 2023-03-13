import { Box, Dialog } from "@mui/material"

export default function Modal(props:{
    open: boolean,
    children: React.ReactNode,
    onClose: () => void
}){
    return <Dialog
        open={props.open}
        onClose={props.onClose}
        PaperProps={{
            elevation: 0,
            sx: {
                width: "100%",
                maxWidth: "600px"
            }
        }}
    >
        <Box sx={{
            margin: 2
        }}>
            {props.children}
        </Box>
    </Dialog>
}