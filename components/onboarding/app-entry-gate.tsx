"use client";

import { useEffect, useState } from "react";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import TranslateRoundedIcon from "@mui/icons-material/TranslateRounded";
import {
  Box,
  Button,
  Stack,
  Typography
} from "@mui/material";
import { KkcLogo } from "@/components/branding/kkc-logo";
import { type AppLanguage, getDefaultLanguage, getSelectedLanguage, hasCompletedOnboarding, saveSelectedLanguage } from "@/lib/app-preferences";

type AppEntryGateProps = {
  children: React.ReactNode;
};

const languageOptions: Array<{ value: AppLanguage; label: string; native: string }> = [
  { value: "hi", label: "Hindi", native: "हिन्दी" },
  { value: "en", label: "English", native: "English" },
  { value: "ta", label: "Tamil", native: "தமிழ்" },
  { value: "kn", label: "Kannada", native: "ಕನ್ನಡ" }
];

export function AppEntryGate({ children }: AppEntryGateProps) {
  const [phase, setPhase] = useState<"splash" | "language" | "done">("splash");
  const [selectedLanguage, setSelectedLanguage] = useState<AppLanguage>(getDefaultLanguage());
  const [splashExiting, setSplashExiting] = useState(false);
  const [languageEntering, setLanguageEntering] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const storedLanguage = getSelectedLanguage();
      setSplashExiting(true);

      window.setTimeout(() => {
        if (storedLanguage && hasCompletedOnboarding()) {
          setSelectedLanguage(storedLanguage);
          setPhase("done");
          return;
        }

        setPhase("language");
        window.requestAnimationFrame(() => {
          setLanguageEntering(true);
        });
      }, 420);
    }, 1700);

    return () => window.clearTimeout(timer);
  }, []);

  if (phase === "splash") {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          position: "relative",
          overflow: "hidden",
          bgcolor: "#f4ecdf",
          background:
            "radial-gradient(circle at 12% 18%, rgba(215,179,138,0.45), transparent 24%), radial-gradient(circle at 88% 12%, rgba(139,94,60,0.18), transparent 20%), linear-gradient(180deg, #f8f1e8 0%, #efe3d3 48%, #e5d1bb 100%)",
          opacity: splashExiting ? 0 : 1,
          transform: splashExiting ? "scale(1.02)" : "scale(1)",
          transition: "opacity 420ms ease, transform 650ms ease"
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            opacity: 0.22,
            backgroundImage:
              "linear-gradient(rgba(111,69,39,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(111,69,39,0.08) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            transform: splashExiting ? "scale(1.08)" : "scale(1)",
            transition: "transform 900ms ease"
          }}
        />
        <Box
          sx={{
            position: "absolute",
            top: -80,
            right: -60,
            width: 240,
            height: 240,
            borderRadius: "42px",
            transform: "rotate(18deg)",
            background: "linear-gradient(160deg, #c89b6d 0%, #8b5e3c 100%)",
            boxShadow: "0 30px 80px rgba(111,69,39,0.18)",
            transition: "transform 900ms ease, opacity 420ms ease",
            opacity: splashExiting ? 0.82 : 1
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: -96,
            left: -40,
            width: 220,
            height: 220,
            borderRadius: "36px",
            transform: "rotate(-16deg)",
            background: "linear-gradient(180deg, #6f4527 0%, #a27448 100%)",
            boxShadow: "0 30px 80px rgba(111,69,39,0.22)",
            transition: "transform 900ms ease, opacity 420ms ease",
            opacity: splashExiting ? 0.82 : 1
          }}
        />
        <Box
          sx={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: "34vh",
            background:
              "linear-gradient(180deg, rgba(111,69,39,0) 0%, rgba(111,69,39,0.10) 18%, rgba(111,69,39,0.18) 100%)"
          }}
        />
        <Box
          sx={{
            position: "relative",
            zIndex: 1,
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            px: 3,
            py: 5,
            opacity: splashExiting ? 0 : 1,
            transform: splashExiting ? "translateY(-14px)" : "translateY(0)",
            transition: "opacity 280ms ease, transform 520ms ease"
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Box
              sx={{
                px: 1.5,
                py: 0.8,
                borderRadius: 999,
                bgcolor: "rgba(255,250,244,0.78)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(111,69,39,0.08)"
              }}
            >
              <Typography variant="caption" sx={{ letterSpacing: "0.18em", textTransform: "uppercase", color: "text.secondary" }}>
                India woodwork network
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700 }}>
              Karigar • Thekedar • Customer
            </Typography>
          </Stack>

          <Stack spacing={3} sx={{ maxWidth: 420 }}>
            <KkcLogo size={96} />
            <Stack spacing={1.5}>
              <Typography
                sx={{
                  fontSize: { xs: 42, sm: 54 },
                  lineHeight: 0.95,
                  fontWeight: 800,
                  letterSpacing: "-0.05em",
                  color: "#2b221c"
                }}
              >
                Kaam.
                <br />
                Karigar.
                <br />
                Control.
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  maxWidth: 320,
                  color: "text.secondary",
                  fontSize: { xs: 16, sm: 18 },
                  lineHeight: 1.5
                }}
              >
                Woodwork hiring, hajri aur trusted work history ko ek polished mobile app feel me le aao.
              </Typography>
            </Stack>
          </Stack>

          <Stack
            spacing={1.2}
            sx={{
              width: "100%",
              maxWidth: 420,
              p: 2,
              borderRadius: 5,
              bgcolor: "rgba(255,250,244,0.82)",
              backdropFilter: "blur(14px)",
              border: "1px solid rgba(111,69,39,0.08)",
              boxShadow: "0 22px 60px rgba(92, 57, 32, 0.12)"
            }}
          >
            <Typography variant="subtitle1" fontWeight={800}>
              Hire. Hajri. History.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Verified karigar profiles, thekedar offers aur payment visibility ek hi place par.
            </Typography>
          </Stack>
        </Box>
      </Box>
    );
  }

  if (phase === "language") {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          bgcolor: "background.default",
          px: 2,
          opacity: languageEntering ? 1 : 0,
          transform: languageEntering ? "translateY(0)" : "translateY(22px)",
          transition: "opacity 520ms ease, transform 520ms ease"
        }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: 440,
            borderRadius: "12px",
            p: { xs: 3, sm: 4 },
            bgcolor: "background.paper",
            boxShadow: "0 24px 80px rgba(68, 41, 20, 0.12)"
          }}
        >
          <Stack spacing={2.5}>
            <Stack direction="row" spacing={1.25} alignItems="center">
              <Box
                sx={{
                  width: 46,
                  height: 46,
                  borderRadius: 3,
                  display: "grid",
                  placeItems: "center",
                  bgcolor: "secondary.light",
                  color: "primary.main"
                }}
              >
                <TranslateRoundedIcon />
              </Box>
              <div>
                <Typography variant="h5" fontWeight={800}>
                  App language choose karo
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Aap baad me bhi language change kar sakte ho.
                </Typography>
              </div>
            </Stack>

            <Stack spacing={1.25}>
              {languageOptions.map((item) => {
                const active = selectedLanguage === item.value;

                return (
                  <Button
                    key={item.value}
                    fullWidth
                    variant={active ? "contained" : "outlined"}
                    onClick={() => setSelectedLanguage(item.value)}
                    sx={{
                      justifyContent: "space-between",
                      py: 1.4,
                      borderRadius: "12px"
                    }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography fontWeight={700}>{item.label}</Typography>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        {item.native}
                      </Typography>
                    </Stack>
                    {active ? <CheckRoundedIcon /> : null}
                  </Button>
                );
              })}
            </Stack>

            <Button
              variant="contained"
              size="large"
              onClick={() => {
                saveSelectedLanguage(selectedLanguage);
                setPhase("done");
              }}
              sx={{ borderRadius: "12px" }}
            >
              Continue to app
            </Button>
          </Stack>
        </Box>
      </Box>
    );
  }

  return <>{children}</>;
}
