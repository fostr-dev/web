import { IconButton, InputAdornment, TextField } from "@mui/material"
import FileCopyIcon from "@mui/icons-material/FileCopy";

export default function CopyTextField({
    value,
    label
}:{
    value: string
    label: string
}){
    return <TextField
        label={label}
        value={value}
        InputProps={{
            readOnly: true,
            endAdornment: <InputAdornment position="end">
                <IconButton
                    onClick={() => {
                        navigator.clipboard.writeText(value)
                    }}
                >
                    <FileCopyIcon />
                </IconButton>
            </InputAdornment>
        }}
    />
}