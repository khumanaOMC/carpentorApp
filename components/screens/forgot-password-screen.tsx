"use client";

import Link from "next/link";
import { useState } from "react";
import { Alert, Box, Button, Card, CardContent, Stack, TextField, Typography } from "@mui/material";
import { forgotPassword } from "@/lib/api/auth";

export function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [resetUrl, setResetUrl] = useState("");

  async function handleSubmit() {
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");
    setResetUrl("");

    try {
      const response = await forgotPassword({ email });
      setSuccessMessage(response.message);
      setResetUrl(response.resetUrl || "");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Forgot password request fail ho gayi.");
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
              <Typography variant="h5">Forgot password</Typography>
              <Typography variant="body2" color="text.secondary">
                Email daalo, reset link generate ho jayega.
              </Typography>
            </div>
            {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}
            {successMessage ? <Alert severity="success">{successMessage}</Alert> : null}
            {resetUrl ? (
              <Alert severity="info">
                Demo reset link: <Link href={resetUrl}>Open reset password</Link>
              </Alert>
            ) : null}
            <TextField label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
            <Button variant="contained" onClick={handleSubmit} disabled={loading}>
              {loading ? "Sending..." : "Send reset link"}
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
