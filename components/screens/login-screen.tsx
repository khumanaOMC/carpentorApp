"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  MenuItem,
  Snackbar,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { loginWithEmailPassword } from "@/lib/api/auth";
import { saveAuthSession } from "@/lib/auth-storage";
import { getSelectedLanguage, type AppLanguage } from "@/lib/app-preferences";

export function LoginScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [language, setLanguage] = useState<AppLanguage>("hi");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const storedLanguage = getSelectedLanguage();
    if (storedLanguage) {
      setLanguage(storedLanguage);
    }
  }, []);

  async function handleLogin() {
    setSubmitting(true);
    setErrorMessage("");

    try {
      const response = await loginWithEmailPassword({ email, password });
      saveAuthSession(response.token, response.user);
      setSnackbarOpen(true);

      const redirectTarget = searchParams.get("redirect");
      if (response.user.role === "admin") {
        router.replace(redirectTarget || "/admin");
        return;
      }

      router.replace(redirectTarget || "/");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
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
        <Card sx={{ width: "100%", maxWidth: 420 }}>
          <CardContent sx={{ p: 2.5 }}>
            <Stack spacing={2}>
              <div>
                <Typography variant="h5">Welcome back</Typography>
                <Typography variant="body2" color="text.secondary">
                  Email/password se login karo. Connect ya contact karne se pehle active plan zaroori rahega.
                </Typography>
              </div>
              <Alert severity="info" sx={{ borderRadius: 3 }}>
                Admin demo login: `admin@kaamkacarpenter.com` / `Admin@12345`
              </Alert>
              {errorMessage ? <Alert severity="error" sx={{ borderRadius: 3 }}>{errorMessage}</Alert> : null}
              <TextField
                label="Email"
                type="email"
                fullWidth
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
              <TextField
                label="Password"
                type="password"
                fullWidth
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              <TextField
                select
                label="Language preview"
                fullWidth
                value={language}
                onChange={(event) => setLanguage(event.target.value as AppLanguage)}
              >
                <MenuItem value="hi">Hindi</MenuItem>
                <MenuItem value="en">English</MenuItem>
                <MenuItem value="ta">Tamil</MenuItem>
                <MenuItem value="kn">Kannada</MenuItem>
              </TextField>
              <Button variant="contained" fullWidth onClick={handleLogin} disabled={submitting}>
                {submitting ? "Logging in..." : "Login"}
              </Button>
              <Typography variant="body2" color="text.secondary" textAlign="center">
                <Link href="/forgot-password">Forgot password?</Link>
              </Typography>
              <Typography variant="body2" color="text.secondary" textAlign="center">
                New user? <Link href="/register">Create account</Link>
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Box>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2200}
        onClose={() => setSnackbarOpen(false)}
        message={`Login successful for ${email || "demo user"}`}
      />
    </>
  );
}
