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

export type ChatThread = {
  id: string;
  bookingId?: string | null;
  participant: {
    userId: string;
    fullName: string;
    mobile?: string;
  } | null;
  messages: Array<{
    id: string;
    senderUserId: string;
    text: string;
    sentAt: string;
  }>;
  lastMessageAt?: string;
};

export function getOrCreateChatThread(payload: { participantUserId: string; bookingId?: string }) {
  return request<{ item: ChatThread }>("/chats/thread", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function getChatThread(id: string) {
  return request<{ item: ChatThread }>(`/chats/${id}`);
}

export function sendChatMessage(id: string, text: string) {
  return request<{ item: ChatThread }>(`/chats/${id}/messages`, {
    method: "POST",
    body: JSON.stringify({ text })
  });
}
