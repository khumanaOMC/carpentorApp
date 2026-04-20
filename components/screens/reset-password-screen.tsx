"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Alert, Box, Button, Card, CardContent, Stack, TextField, Typography } from "@mui/material";
import { resetPassword } from "@/lib/api/auth";

export function ResetPasswordScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState(searchParams.get("token") || "");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function handleSubmit() {
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await resetPassword({ token, password });
      setSuccessMessage(response.message);
      setTimeout(() => router.replace("/login"), 1200);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Reset password fail ho gaya.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", bgcolor: "background.default", p: 2 }}>
      <Card sx={{ width: "100%", maxWidth: 420 }}>
        <CardContent sx={{ p: 2.5 }}>
          <Stack spacing={2}>
            <div>
              <Typography variant="h5">Reset password</Typography>
              <Typography variant="body2" color="text.secondary">
                Token aur naya password daal kar account recover karo.
              </Typography>
            </div>
            {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}
            {successMessage ? <Alert severity="success">{successMessage}</Alert> : null}
            <TextField label="Reset token" value={token} onChange={(event) => setToken(event.target.value)} />
            <TextField label="New password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
            <Button variant="contained" onClick={handleSubmit} disabled={loading}>
              {loading ? "Resetting..." : "Reset password"}
            </Button>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              Back to <Link href="/login">login</Link>
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
