import { getAuthToken } from "@/lib/auth-storage";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ??
  (process.env.NODE_ENV === "development" ? "http://localhost:4000/api/v1" : "/api/v1");

type QueryValue = string | undefined;

function buildUrl(path: string, query?: Record<string, QueryValue>) {
  const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
  const url = new URL(`${API_BASE}${path}`, origin);
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value) {
        url.searchParams.set(key, value);
      }
    });
  }
  return url.toString();
}

async function request<T>(path: string, init?: RequestInit, query?: Record<string, QueryValue>): Promise<T> {
  const token = getAuthToken();
  const headers = new Headers(init?.headers);

  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(buildUrl(path, query), {
    ...init,
    headers,
    cache: "no-store",
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error((data as { message?: string }).message || `Request failed: ${response.status}`);
  }

  return data as T;
}

export function getAdminDashboard() {
  return request<{ stats: { users: number; pendingKyc: number; activeBookings: number; revenue: number } }>(
    "/admin/dashboard"
  );
}

export function getAdminUsers(query?: { role?: string; status?: string; search?: string }) {
  return request<{ items: Array<{ id: string; name: string; email: string; mobile: string; role: string; status: string }> }>(
    "/admin/users",
    undefined,
    query
  );
}

export function updateAdminUserStatus(id: string, status: string) {
  return request<{ item: { id: string; name: string; email: string; mobile: string; role: string; status: string } }>(
    `/admin/users/${id}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({ status })
    }
  );
}

export function createAdminUserDemo() {
  return request<{ item: { id: string; name: string; email: string; mobile: string; role: string; status: string } }>(
    "/admin/users/demo",
    { method: "POST", body: JSON.stringify({}) }
  );
}

export function deleteAdminUser(id: string) {
  return request<{ ok: true }>(`/admin/users/${id}`, { method: "DELETE" });
}

export function getAdminKyc(query?: { status?: string; search?: string }) {
  return request<{ items: Array<{ id: string; name: string; city: string; skill: string; status: string; risk: string }> }>(
    "/admin/kyc",
    undefined,
    query
  );
}

export function approveAdminKyc(id: string) {
  return request<{ item: { id: string; name: string; city: string; skill: string; status: string; risk: string } }>(
    `/admin/kyc/${id}/approve`,
    { method: "PATCH" }
  );
}

export function rejectAdminKyc(id: string) {
  return request<{ item: { id: string; name: string; city: string; skill: string; status: string; risk: string } }>(
    `/admin/kyc/${id}/reject`,
    { method: "PATCH" }
  );
}

export function getAdminBookings(query?: { status?: string; search?: string }) {
  return request<{ items: Array<{ id: string; title: string; city: string; worker: string; status: string; payment: string }> }>(
    "/admin/bookings",
    undefined,
    query
  );
}

export function updateAdminBookingStatus(id: string, status: string) {
  return request<{ item: { id: string; title: string; city: string; worker: string; status: string; payment: string } }>(
    `/admin/bookings/${id}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({ status })
    }
  );
}

export function createAdminBookingDemo() {
  return request<{ item: { id: string; title: string; city: string; worker: string; status: string; payment: string } }>(
    "/admin/bookings/demo",
    { method: "POST", body: JSON.stringify({}) }
  );
}

export function deleteAdminBooking(id: string) {
  return request<{ ok: true }>(`/admin/bookings/${id}`, { method: "DELETE" });
}

export function getAdminPayments(query?: { status?: string; search?: string }) {
  return request<{ items: Array<{ id: string; label: string; meta: string; status: string }> }>(
    "/admin/payments",
    undefined,
    query
  );
}

export function updateAdminPaymentStatus(id: string, status: string) {
  return request<{ item: { id: string; label: string; meta: string; status: string } }>(
    `/admin/payments/${id}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({ status })
    }
  );
}

export function createAdminPaymentDemo() {
  return request<{ item: { id: string; label: string; meta: string; status: string } }>(
    "/admin/payments/demo",
    { method: "POST", body: JSON.stringify({}) }
  );
}

export function deleteAdminPayment(id: string) {
  return request<{ ok: true }>(`/admin/payments/${id}`, { method: "DELETE" });
}
