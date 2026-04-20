"use client";

export type AuthUser = {
  id: string;
  fullName: string;
  email: string;
  mobile: string;
  role: string;
  status: string;
  profileCompleted: boolean;
  language?: "hi" | "en" | "ta" | "kn";
  selectedPlan?: "basic" | "standard" | "pro";
  billingCycle?: "monthly" | "yearly";
  planStatus?: "active" | "pending" | "cancelled";
};

const TOKEN_KEY = "kkc_auth_token";
const USER_KEY = "kkc_auth_user";

function canUseStorage() {
  return typeof window !== "undefined";
}

export function saveAuthSession(token: string, user: AuthUser) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(TOKEN_KEY, token);
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getAuthToken() {
  if (!canUseStorage()) {
    return null;
  }

  return window.localStorage.getItem(TOKEN_KEY);
}

export function getAuthUser(): AuthUser | null {
  if (!canUseStorage()) {
    return null;
  }

  const raw = window.localStorage.getItem(USER_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function clearAuthSession() {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
}
