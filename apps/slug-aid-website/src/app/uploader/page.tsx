"use client";

import Link from "next/link";
import { Box, Button, Typography, Stack, Paper } from "@mui/material";

export default function UploaderHubPage() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        p: 3,
      }}
    >
      <Paper elevation={3} sx={{ p: 4, width: "100%", maxWidth: 500 }}>
        <Typography variant="h4" gutterBottom>
          Select Facility
        </Typography>

        <Stack spacing={2}>
          <Button
            component={Link}
            href="/uploader/redwood-free-market"
            variant="contained"
            fullWidth
          >
            Redwood
          </Button>

          <Button
            component={Link}
            href="/uploader/cowell-coffee-shop"
            variant="contained"
            fullWidth
          >
            Cowell
          </Button>

          <Button
            component={Link}
            href="/uploader/ethnic-resource-center"
            variant="contained"
            fullWidth
          >
            Ethnic Resource Center
          </Button>

		            <Button
            component={Link}
            href="/uploader/lionel-cantu"
            variant="contained"
            fullWidth
          >
            Lionel Cantu
          </Button>

		            <Button
            component={Link}
            href="/uploader/terry-freitas-commons"
            variant="contained"
            fullWidth
          >
            Terry Freitas
          </Button>

		            <Button
            component={Link}
            href="/uploader/produce-pop-up"
            variant="contained"
            fullWidth
          >
            Produce Pop Up
          </Button>

		            <Button
            component={Link}
            href="/uploader/womens-center"
            variant="contained"
            fullWidth
          >
            Womens Center
          </Button>

		            <Button
            component={Link}
            href="/uploader/agrecology"
            variant="contained"
            fullWidth
          >
            Agrecology
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}