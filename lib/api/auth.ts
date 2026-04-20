import { getAuthToken } from "@/lib/auth-storage";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

type AuthResponse = {
  token: string;
  user: {
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
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getAuthToken();
  const headers = new Headers(init?.headers);

  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
    cache: "no-store"
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error((data && data.message) || `Request failed: ${response.status}`);
  }

  return data as T;
}

export function loginWithEmailPassword(payload: { email: string; password: string }) {
  return request<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function getCurrentUser() {
  return request<{ user: AuthResponse["user"] }>("/auth/me");
}

export function forgotPassword(payload: { email: string }) {
  return request<{ message: string; resetToken?: string; resetUrl?: string }>("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function resetPassword(payload: { token: string; password: string }) {
  return request<{ message: string }>("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}
