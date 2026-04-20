import { getAuthToken, getAuthUser, saveAuthSession } from "@/lib/auth-storage";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ??
  (process.env.NODE_ENV === "development" ? "http://localhost:4000/api/v1" : "/api/v1");

async function request<T>(path: string) {
  const token = getAuthToken();
  const headers = new Headers({ "Content-Type": "application/json" });

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${path}`, {
    headers,
    cache: "no-store"
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error((data as { message?: string }).message || `Request failed: ${response.status}`);
  }

  return data as T;
}

async function requestWithBody<T>(path: string, init: RequestInit) {
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

export function getMyThekedars() {
  return request<{ items: Array<{ id: string; userId: string; name: string; city: string; phone: string; type: string }> }>("/users/my-thekedar");
}

export function getMyKarigars() {
  return request<{ items: Array<{ id: string; userId: string; name: string; city: string; phone: string; availabilityStatus: string; skills: string[] }> }>("/users/my-karigar");
}

export function getMyOffers() {
  return request<{
    items: Array<{
      id: string;
      contractorId: string;
      carpenterId: string;
      contractorName: string;
      carpenterName: string;
      jobTitle: string;
      city: string;
      rateLabel: string;
      paymentTerms: string;
      durationDays: number;
      outstationAllowance: number;
      overtimeRate: number;
      message: string;
      status: string;
    }>;
  }>("/offers/my");
}

export function respondToOffer(id: string, action: "accept" | "reject") {
  const token = getAuthToken();
  const headers = new Headers({ "Content-Type": "application/json" });

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return fetch(`${API_BASE}/offers/${id}/respond`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ action }),
    cache: "no-store"
  }).then(async (response) => {
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error((data as { message?: string }).message || `Request failed: ${response.status}`);
    }

    return data as { item: { id: string; status: string } };
  });
}

export function getMyAttendanceSummary() {
  return request<{
    summary: {
      totalDays: number;
      approvedDays: number;
      overtimeHours: number;
      pendingApprovals: number;
      estimatedEarnings: number;
    };
    items: Array<{
      id: string;
      date: string;
      attendanceType: string;
      approvalStatus: string;
      overtimeHours: number;
      shiftHours: number;
    }>;
  }>("/attendance/my-summary");
}

export function getIncomingCarpenterRequests() {
  return request<{
    items: Array<{
      id: string;
      carpenterId: string;
      carpenterUserId: string;
      carpenterName: string;
      phone: string;
      city: string;
      skills: string[];
      proposedRate: number;
      coverNote: string;
      status: string;
    }>;
  }>("/applications/incoming");
}

export function respondToCarpenterRequest(id: string, status: "accepted" | "rejected") {
  return requestWithBody<{ id: string; status: string }>(`/applications/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status })
  });
}

export function getMyPlan() {
  return request<{
    plan: {
      selectedPlan: "basic" | "standard" | "pro";
      billingCycle: "monthly" | "yearly";
      status: "active" | "pending" | "cancelled";
      updatedAt?: string;
      history: Array<{
        plan: "basic" | "standard" | "pro";
        billingCycle: "monthly" | "yearly";
        status: "active" | "pending" | "cancelled";
        changedAt?: string;
      }>;
    };
  }>("/users/plan");
}

export async function updateMyPlan(payload: {
  selectedPlan: "basic" | "standard" | "pro";
  billingCycle: "monthly" | "yearly";
}) {
  const data = await requestWithBody<{
    plan: {
      selectedPlan: "basic" | "standard" | "pro";
      billingCycle: "monthly" | "yearly";
      status: "active" | "pending" | "cancelled";
      updatedAt?: string;
      history: Array<{
        plan: "basic" | "standard" | "pro";
        billingCycle: "monthly" | "yearly";
        status: "active" | "pending" | "cancelled";
        changedAt?: string;
      }>;
    };
  }>("/users/plan", {
    method: "PATCH",
    body: JSON.stringify(payload)
  });

  const authUser = getAuthUser();
  const token = getAuthToken();
  if (authUser && token) {
    saveAuthSession(token, {
      ...authUser,
      selectedPlan: data.plan.selectedPlan,
      billingCycle: data.plan.billingCycle,
      planStatus: data.plan.status
    });
  }

  return data;
}
