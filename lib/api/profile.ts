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

function buildUrl(path: string, query?: Record<string, string | undefined>) {
  const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
  const url = new URL(`${API_BASE}${path}`, origin);

  Object.entries(query || {}).forEach(([key, value]) => {
    if (value) {
      url.searchParams.set(key, value);
    }
  });

  return url.toString();
}

async function request<T>(path: string, init?: RequestInit) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: authHeaders(),
    cache: "no-store"
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error((data as { message?: string }).message || `Request failed: ${response.status}`);
  }

  return data as T;
}

export type CurrentUserProfile = {
  user: {
    id: string;
    fullName: string;
    email: string;
    mobile: string;
    role: string;
    status: string;
    profileCompleted: boolean;
    profile?: {
      experienceYears?: number;
      skills?: string[];
      availabilityStatus?: string;
      currentLocation?: {
        state?: string;
        city?: string;
        pincode?: string;
      };
      rateCard?: {
        daily?: number;
        halfDay?: number;
        oneAndHalfDay?: number;
        monthly?: number;
        overtimePerHour?: number;
      };
      businessLocation?: {
        state?: string;
        city?: string;
        pincode?: string;
        address?: string;
      };
      profileType?: string;
      bio?: string;
      profilePhotoUrl?: string;
      address?: {
        state?: string;
        city?: string;
        pincode?: string;
        fullAddress?: string;
      };
      customerType?: string;
      averageRating?: number;
      totalEarnings?: number;
      kycStatus?: string;
      portfolioItems?: Array<{
        mediaType?: "image" | "video";
        url?: string;
        caption?: string;
      }>;
    };
  };
};

export function getMyProfile() {
  return request<CurrentUserProfile>("/users/me");
}

export function updateMyProfile(payload: Record<string, unknown>) {
  return request<CurrentUserProfile>("/users/me", {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
}

export type CarpenterDirectoryItem = {
  id: string;
  fullName: string;
  city: string;
  state: string;
  pincode: string;
  skills: string[];
  availabilityStatus: string;
  averageRating: number;
  experienceYears: number;
  rateCard: {
    daily?: number;
    halfDay?: number;
    oneAndHalfDay?: number;
    monthly?: number;
    overtimePerHour?: number;
  };
  kycStatus: string;
  profilePhotoUrl?: string;
  portfolioItems?: Array<{
    mediaType?: "image" | "video";
    url?: string;
    caption?: string;
  }>;
};

export type ContractorDirectoryItem = {
  id: string;
  fullName: string;
  city: string;
  state: string;
  phone: string;
  type: string;
  profilePhotoUrl?: string;
  bio?: string;
  totalJobs: number;
  completedJobs: number;
  activeJobs: number;
  averageRating: number;
};

export function getCarpenters(query?: { search?: string; city?: string; pincode?: string; availabilityStatus?: string }) {
  return fetch(buildUrl("/carpenters", query), { cache: "no-store" })
    .then(async (response) => {
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error((data as { message?: string }).message || `Request failed: ${response.status}`);
      }
      return data as { items: CarpenterDirectoryItem[] };
    });
}

export function getContractors(query?: { search?: string; city?: string }) {
  return fetch(buildUrl("/contractors", query), { cache: "no-store" })
    .then(async (response) => {
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error((data as { message?: string }).message || `Request failed: ${response.status}`);
      }
      return data as { items: ContractorDirectoryItem[] };
    });
}
