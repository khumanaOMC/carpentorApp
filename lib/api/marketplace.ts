import { getAuthToken, getAuthUser } from "@/lib/auth-storage";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

function buildUrl(path: string, query?: Record<string, string | undefined>) {
  const url = new URL(`${API_BASE}${path}`);

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value) {
        url.searchParams.set(key, value);
      }
    });
  }

  return url.toString();
}

async function request<T>(path: string, init?: RequestInit, query?: Record<string, string | undefined>) {
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
    cache: "no-store"
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error((data as { message?: string }).message || `Request failed: ${response.status}`);
  }

  return data as T;
}

export type JobListItem = {
  id: string;
  title: string;
  location: string;
  city: string;
  description: string;
  rate: string;
  workType: string;
  postedBy: {
    userId: string;
    contractorId: string;
    name: string;
    phone: string;
    city: string;
    type: string;
  };
  tags: string[];
  status: string;
};

export type BookingListItem = {
  id: string;
  title: string;
  party: string;
  amount: string;
  progress: number;
  status: string;
  counterparty?: {
    userId: string;
    name: string;
    role: string;
  } | null;
};

export type AttendanceListItem = {
  id: string;
  worker: string;
  shift: string;
  note: string;
  approved: boolean;
  approvalStatus: string;
};

export function registerUser(payload: {
  fullName: string;
  email: string;
  mobile: string;
  password: string;
  role: "carpenter" | "contractor" | "customer";
  language: "hi" | "en" | "ta" | "kn";
  city?: string;
  state?: string;
  pincode?: string;
  bio?: string;
  experienceYears?: number;
  skills?: string[];
  availabilityStatus?: "available" | "busy" | "outstation";
  dailyRate?: number;
  halfDayRate?: number;
  oneAndHalfDayRate?: number;
  monthlyRate?: number;
  overtimeRate?: number;
}) {
  return request<{
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
  }>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function getJobs(query?: { search?: string; city?: string; rateModel?: string }) {
  return request<{ items: JobListItem[] }>("/jobs", undefined, query);
}

export function applyToJob(payload: { jobId: string; proposedRate?: number; coverNote?: string }) {
  const user = getAuthUser();

  if (!user) {
    throw new Error("Login karke hi job apply kar sakte ho.");
  }

  return request<{ item: { id: string; status: string; message: string } }>("/applications", {
    method: "POST",
    body: JSON.stringify({
      ...payload,
      applicantUserId: user.id
    })
  });
}

export function sendContractorRequest(payload: { contractorId: string; proposedRate?: number; coverNote?: string }) {
  const user = getAuthUser();

  if (!user) {
    throw new Error("Login karke hi request bhej sakte ho.");
  }

  return request<{ item: { id: string; status: string; message: string } }>("/applications/direct", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function getBookings(query?: { status?: string }) {
  return request<{ items: BookingListItem[] }>("/bookings", undefined, query);
}

export function createBooking(payload: {
  carpenterId: string;
  rateModel: string;
  agreedRate: number;
  schedule?: {
    startDate?: string;
    endDate?: string;
  };
}) {
  return request<{ item: BookingListItem }>("/bookings", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function updateBookingStatus(id: string, status: string) {
  return request<{ item: BookingListItem }>(`/bookings/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status })
  });
}

export function getAttendanceLogs(bookingId: string) {
  return request<{ items: AttendanceListItem[] }>(`/attendance/booking/${bookingId}`);
}

export function approveAttendance(id: string) {
  return request<{ item: AttendanceListItem }>(`/attendance/${id}/approve`, {
    method: "PATCH",
    body: JSON.stringify({ status: "approved" })
  });
}
