import { getAuthToken } from "@/lib/auth-storage";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ??
  (process.env.NODE_ENV === "development" ? "http://localhost:4000/api/v1" : "/api/v1");

function authHeaders() {
  const headers = new Headers({ "Content-Type": "application/json" });
  const token = getAuthToken();

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return headers;
}

export async function submitReview(payload: {
  bookingId?: string;
  revieweeUserId: string;
  rating: number;
  title?: string;
  comment?: string;
}) {
  const response = await fetch(`${API_BASE}/reviews`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
    cache: "no-store"
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error((data as { message?: string }).message || `Request failed: ${response.status}`);
  }

  return data as {
    item: {
      id: string;
      rating: number;
      title: string;
      comment: string;
      reviewerRole: string;
    };
  };
}
