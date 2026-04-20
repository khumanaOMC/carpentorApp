"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { type AppLanguage, getDefaultLanguage, getSelectedLanguage, saveSelectedLanguage } from "@/lib/app-preferences";
import { getAuthUser } from "@/lib/auth-storage";

type AppLanguageProviderProps = {
  children: React.ReactNode;
};

type LanguageContextValue = {
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function AppLanguageProvider({ children }: AppLanguageProviderProps) {
  const [language, setLanguageState] = useState<AppLanguage>(getDefaultLanguage());

  useEffect(() => {
    const storedLanguage = getSelectedLanguage();
    const authLanguage = getAuthUser()?.language;

    if (storedLanguage) {
      setLanguageState(storedLanguage);
      return;
    }

    if (authLanguage) {
      setLanguageState(authLanguage);
      return;
    }

    setLanguageState(getDefaultLanguage());
  }, []);

  const value = useMemo(
    () => ({
      language,
      setLanguage: (nextLanguage: AppLanguage) => {
        setLanguageState(nextLanguage);
        saveSelectedLanguage(nextLanguage);
      }
    }),
    [language]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useAppLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useAppLanguage must be used within AppLanguageProvider");
  }

  return context;
}
