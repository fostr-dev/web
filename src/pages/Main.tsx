import { Box } from "@mui/material";

export default function Main(){
    return <Box sx={{
      minHeight: "var(--app-height)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      width: "100%",

      ".card-group": {
          display: "flex",
          flexDirection: "row",
          gap: 2,
          padding: 2,
          justifyContent: "center",
          flexWrap: "wrap",
          width: "100%",

          "& > *": {
              width: "100%",
              maxWidth: 600,
              padding: 2,
              display: "flex",
              flexDirection: "column",
              gap: 2,
              alignItems: "center",
              textAlign: "center",

              "& > *": {
                  width: "100%"
              }
          }
      }
  }}>
        <TextField
            label="Search for an user"
        />
    </Box>
}