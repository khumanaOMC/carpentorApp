import { getAuthToken } from "@/lib/auth-storage";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

async function request<T>(path: string, init?: RequestInit) {
  const token = getAuthToken();
  const headers = new Headers({ "Content-Type": "application/json" });

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
    throw new Error((data as { message?: string }).message || `Request failed: ${response.status}`);
  }

  return data as T;
}

export type NotificationItem = {
  id: string;
  title: string;
  body: string;
  isRead: boolean;
  type: string;
  createdAt: string;
};

export function getNotifications() {
  return request<{ items: NotificationItem[] }>("/notifications");
}

export function markNotificationRead(id: string) {
  return request<{ ok: true; message: string }>(`/notifications/${id}/read`, {
    method: "PATCH"
  });
}
