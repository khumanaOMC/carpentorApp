"use client";

export type AppLanguage = "hi" | "en" | "ta" | "kn";

const LANGUAGE_KEY = "kkc_app_language";
const ONBOARDING_KEY = "kkc_app_onboarding_done";

function canUseStorage() {
  return typeof window !== "undefined";
}

export function getSelectedLanguage(): AppLanguage | null {
  if (!canUseStorage()) {
    return null;
  }

  const value = window.localStorage.getItem(LANGUAGE_KEY);
  if (value === "hi" || value === "en" || value === "ta" || value === "kn") {
    return value;
  }

  return null;
}

export function getDefaultLanguage(): AppLanguage {
  return "en";
}

export function saveSelectedLanguage(language: AppLanguage) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(LANGUAGE_KEY, language);
  window.localStorage.setItem(ONBOARDING_KEY, "done");
}

export function hasCompletedOnboarding() {
  if (!canUseStorage()) {
    return false;
  }

  return window.localStorage.getItem(ONBOARDING_KEY) === "done";
}
