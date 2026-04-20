import type { AuthUser } from "@/lib/auth-storage";

export function hasActivePlan(user: AuthUser | null) {
  return Boolean(user && user.selectedPlan && user.planStatus === "active");
}

export function getConnectAccessState(user: AuthUser | null, redirectPath: string) {
  if (!user) {
    return {
      allowed: false,
      redirectTo: `/login?redirect=${encodeURIComponent(redirectPath)}`,
      message: "Connect karne se pehle login karo."
    };
  }

  if (!hasActivePlan(user)) {
    return {
      allowed: false,
      redirectTo: "/my-account",
      message: "Connect karne ke liye active plan buy ya activate karna zaroori hai."
    };
  }

  return {
    allowed: true,
    redirectTo: null,
    message: ""
  };
}

export function getContactLockMessage(user: AuthUser | null) {
  if (!user) {
    return "Contact karne ke liye pehle login karo.";
  }

  if (!hasActivePlan(user)) {
    return "Contact karne ke liye active plan zaroori hai. My Account me plan buy ya activate karo.";
  }

  return "";
}
