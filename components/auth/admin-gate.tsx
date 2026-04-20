"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, CircularProgress, Stack, Typography } from "@mui/material";
import { AdminScreen } from "@/components/screens/admin-screen";
import { getCurrentUser } from "@/lib/api/auth";
import { clearAuthSession, getAuthToken, getAuthUser, saveAuthSession } from "@/lib/auth-storage";

export function AdminGate() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;

    async function verifySession() {
      const token = getAuthToken();
      const localUser = getAuthUser();

      if (!token || !localUser) {
        router.replace("/login?redirect=/admin");
        return;
      }

      try {
        const response = await getCurrentUser();

        if (response.user.role !== "admin") {
          clearAuthSession();
          router.replace("/login?redirect=/admin");
          return;
        }

        saveAuthSession(token, response.user);

        if (active) {
          setReady(true);
        }
      } catch {
        clearAuthSession();
        router.replace("/login?redirect=/admin");
      }
    }

    verifySession();

    return () => {
      active = false;
    };
  }, [router]);

  if (!ready) {
    return (
      <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", bgcolor: "background.default" }}>
        <Stack spacing={2} alignItems="center">
          <CircularProgress />
          <Typography variant="body2" color="text.secondary">
            Admin session verify ho rahi hai...
          </Typography>
        </Stack>
      </Box>
    );
  }

  return <AdminScreen />;
}
