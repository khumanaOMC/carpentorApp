const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

async function request<T>(path: string) {
  const response = await fetch(`${API_BASE}${path}`, {
    cache: "no-store"
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error((data as { message?: string }).message || `Request failed: ${response.status}`);
  }

  return data as T;
}

export function getContractorPublicProfile(id: string) {
  return request<{
    item: {
      id: string;
      userId: string;
      fullName: string;
      city: string;
      phone: string;
      type: string;
      totalJobs: number;
      completedJobs: number;
      activeJobs: number;
      totalPaidAmount: number;
      averageRating: number;
      reviews: Array<{
        id: string;
        rating: number;
        title: string;
        comment: string;
        reviewerName: string;
        reviewerRole: string;
        createdAt: string;
      }>;
      workHistory: Array<{
        id: string;
        carpenterId: string;
        carpenterName: string;
        jobTitle: string;
        status: string;
        rateModel: string;
        agreedRate: number;
        createdAt: string;
      }>;
      activeJobsPosted: Array<{
        id: string;
        title: string;
        city: string;
        carpenterCountNeeded: number;
        status: string;
        createdAt: string;
      }>;
    };
  }>(`/contractors/${id}`);
}

export function getCarpenterPublicProfile(id: string) {
  return request<{
    item: {
      id: string;
      userId: string;
      fullName: string;
      phone: string;
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
        monthly?: number;
        overtimePerHour?: number;
      };
      kycStatus: string;
      totalJobs: number;
      completedJobs: number;
      reviews: Array<{
        id: string;
        rating: number;
        title: string;
        comment: string;
        reviewerName: string;
        reviewerRole: string;
        createdAt: string;
      }>;
      attendanceHistory: Array<{
        id: string;
        contractorName: string;
        contractorPhone: string;
        date: string;
        attendanceType: string;
        approvalStatus: string;
        shiftHours: number;
        overtimeHours: number;
        dailyRate: number;
        rateModel: string;
      }>;
    };
  }>(`/carpenters/${id}`);
}
