export type UserRolePlan = "carpenter" | "contractor" | "customer";
export type SubscriptionPlan = "basic" | "standard" | "pro";

export const rolePlanCopy: Record<UserRolePlan, { title: string; subtitle: string }> = {
  carpenter: {
    title: "Karigar plans",
    subtitle: "Lead access, portfolio aur earning tools plan ke hisaab se unlock honge."
  },
  contractor: {
    title: "Thekedar plans",
    subtitle: "Hiring scale, hajri controls aur settlement power plan ke hisaab se badhegi."
  },
  customer: {
    title: "Customer plans",
    subtitle: "Search, booking aur support access plan ke hisaab se better hota jayega."
  }
};

export const planCatalog: Record<UserRolePlan, Array<{
  id: SubscriptionPlan;
  name: string;
  price: string;
  badge?: string;
  highlight?: boolean;
  features: string[];
}>> = {
  carpenter: [
    {
      id: "basic",
      name: "Basic",
      price: "Free",
      features: [
        "Local city listing",
        "Basic profile + photo",
        "3 portfolio items",
        "Limited thekedar offers view"
      ]
    },
    {
      id: "standard",
      name: "Standard",
      price: "₹299 / month",
      badge: "Most used",
      highlight: true,
      features: [
        "Priority listing in city",
        "15 portfolio items",
        "Outstation job apply",
        "Hajri and earnings summary"
      ]
    },
    {
      id: "pro",
      name: "Pro",
      price: "₹699 / month",
      badge: "Top reach",
      features: [
        "All India visibility",
        "Unlimited portfolio gallery",
        "Top badge on profile",
        "Fast payout and premium support"
      ]
    }
  ],
  contractor: [
    {
      id: "basic",
      name: "Basic",
      price: "₹499 / month",
      features: [
        "2 active job posts",
        "5 carpenter shortlist",
        "Basic call/chat access",
        "Manual settlement notes"
      ]
    },
    {
      id: "standard",
      name: "Standard",
      price: "₹1,499 / month",
      badge: "Best value",
      highlight: true,
      features: [
        "10 active job posts",
        "Bulk hire and offers",
        "Attendance approval tools",
        "Payment tracking dashboard"
      ]
    },
    {
      id: "pro",
      name: "Pro",
      price: "₹3,999 / month",
      badge: "For teams",
      features: [
        "Unlimited projects",
        "Team sub-admin access",
        "Advanced hajri + export",
        "Priority dispute and account manager"
      ]
    }
  ],
  customer: [
    {
      id: "basic",
      name: "Basic",
      price: "Free",
      features: [
        "Search nearby karigar",
        "Basic profile view",
        "1 active booking at a time",
        "Standard support"
      ]
    },
    {
      id: "standard",
      name: "Standard",
      price: "₹149 / month",
      badge: "Popular",
      highlight: true,
      features: [
        "Priority callback",
        "Faster quotation response",
        "Multiple booking requests",
        "Saved carpenter shortlist"
      ]
    },
    {
      id: "pro",
      name: "Pro",
      price: "₹399 / month",
      badge: "Premium care",
      features: [
        "Priority support",
        "Verified pro suggestions",
        "Dedicated booking follow-up",
        "Dispute priority handling"
      ]
    }
  ]
};
