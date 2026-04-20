"use client";

import { type ReactNode, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Box, CircularProgress, Stack, Typography } from "@mui/material";
import { getCurrentUser } from "@/lib/api/auth";
import { clearAuthSession, getAuthToken, getAuthUser, saveAuthSession } from "@/lib/auth-storage";

type UserGateProps = {
  children: ReactNode;
};

export function UserGate({ children }: UserGateProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;

    async function verifySession() {
      const token = getAuthToken();
      const localUser = getAuthUser();

      if (!token || !localUser) {
        router.replace(`/login?redirect=${encodeURIComponent(pathname || "/")}`);
        return;
      }

      try {
        const response = await getCurrentUser();
        saveAuthSession(token, response.user);

        if (active) {
          setReady(true);
        }
      } catch {
        clearAuthSession();
        router.replace(`/login?redirect=${encodeURIComponent(pathname || "/")}`);
      }
    }

    verifySession();

    return () => {
      active = false;
    };
  }, [pathname, router]);

  if (!ready) {
    return (
      <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", bgcolor: "background.default" }}>
        <Stack spacing={2} alignItems="center">
          <CircularProgress />
          <Typography variant="body2" color="text.secondary">
            Login session verify ho rahi hai...
          </Typography>
        </Stack>
      </Box>
    );
  }

  return <>{children}</>;
}
