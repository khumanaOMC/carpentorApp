import Link from "next/link";
import { AuthCard } from "@/components/forms/auth-card";
import { Box, Stack, Typography } from "@mui/material";

export function RegisterScreen() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2
      }}
    >
      <Stack spacing={2} sx={{ width: "100%", maxWidth: 420 }}>
        <div>
          <Typography variant="h5">Create account</Typography>
          <Typography variant="body2" color="text.secondary">
            Karigar, thekedar ya customer ke roop me join karo aur plan choose karo.
          </Typography>
        </div>
        <AuthCard />
        <Typography variant="body2" color="text.secondary" textAlign="center">
          Already registered? <Link href="/login">Login</Link>
        </Typography>
      </Stack>
    </Box>
  );
}
