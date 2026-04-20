"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { ThemeProvider } from "@mui/material/styles";
import { createAppTheme, type AppThemeMode } from "@/lib/theme";

type AppThemeProviderProps = {
  children: React.ReactNode;
};

type ThemeModeContextValue = {
  mode: AppThemeMode;
  toggleMode: () => void;
};

const ThemeModeContext = createContext<ThemeModeContextValue | null>(null);
const STORAGE_KEY = "kkc_theme_mode";

export function AppThemeProvider({ children }: AppThemeProviderProps) {
  const [mode, setMode] = useState<AppThemeMode>("light");

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "light" || saved === "dark") {
      setMode(saved);
      return;
    }

    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setMode(prefersDark ? "dark" : "light");
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, mode);
    document.documentElement.dataset.theme = mode;
    document.documentElement.style.colorScheme = mode;
  }, [mode]);

  const theme = useMemo(() => createAppTheme(mode), [mode]);
  const value = useMemo(
    () => ({
      mode,
      toggleMode: () => setMode((current) => (current === "light" ? "dark" : "light"))
    }),
    [mode]
  );

  return (
    <ThemeModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ThemeModeContext.Provider>
  );
}

export function useThemeMode() {
  const context = useContext(ThemeModeContext);

  if (!context) {
    throw new Error("useThemeMode must be used within AppThemeProvider");
  }

  return context;
}
