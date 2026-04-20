export const roleStats = [
  { label: "Available carpenters", value: "3,240" },
  { label: "Active contractor jobs", value: "482" },
  { label: "Cities covered", value: "112" }
];

export const quickActions = [
  "Nearby carpenter search",
  "Post a new job",
  "Approve today's hajri",
  "Track payments"
];

export const homeSections = [
  {
    title: "Nearby experts",
    subtitle: "Verified workers around your city and PIN code",
    items: ["Furniture fitting", "Modular kitchen", "Repair and polish"]
  },
  {
    title: "Fast hiring",
    subtitle: "Contractor ke liye multi-worker hiring with work model support",
    items: ["Daily wage", "Per sq ft", "Monthly labour"]
  },
  {
    title: "Hajri and settlement",
    subtitle: "Check-in, overtime aur advance tracking ek hi flow me",
    items: ["GPS log", "Approval queue", "Final settlement"]
  }
];

export const jobs = [
  {
    id: "job-101",
    title: "Modular kitchen fitting",
    location: "Noida Sector 62",
    city: "Delhi NCR",
    description:
      "2 skilled carpenters needed for modular kitchen assembly, fitting and final polish at residential site.",
    rate: "₹1,200/day",
    workType: "Daily wage",
    tags: ["2 carpenters", "Urgent", "3 days"],
    status: "Open"
  },
  {
    id: "job-102",
    title: "Office partition woodwork",
    location: "Gurugram Udyog Vihar",
    city: "Delhi NCR",
    description:
      "Commercial office partition and false ceiling wood framing work for interior contractor.",
    rate: "₹145/sq ft",
    workType: "Per sq ft",
    tags: ["5 carpenters", "Outstation ok", "7 days"],
    status: "Shortlisting"
  },
  {
    id: "job-103",
    title: "Door and window polishing",
    location: "Lucknow Gomti Nagar",
    city: "Lucknow",
    description:
      "Polish and finishing support for villa door/window package. Half-day workers also considered.",
    rate: "₹850/day",
    workType: "Half day",
    tags: ["Half day option", "Labour only", "Weekend"],
    status: "Open"
  }
];

export const bookings = [
  {
    id: "booking-301",
    title: "Wardrobe installation",
    party: "Booked by Amit Sharma",
    amount: "₹4,500 pending",
    progress: 64,
    status: "active"
  },
  {
    id: "booking-302",
    title: "Retail shelving setup",
    party: "Contractor: BuildEdge Interiors",
    amount: "₹18,000 settlement due",
    progress: 82,
    status: "pending"
  },
  {
    id: "booking-303",
    title: "Kitchen repair visit",
    party: "Booked by Seema Arora",
    amount: "Paid and completed",
    progress: 100,
    status: "completed"
  }
];

export const attendanceLogs = [
  {
    id: "attendance-1",
    worker: "Rakesh Suthar",
    shift: "Check-in 9:04 AM",
    note: "Full day • overtime 1.5 hr",
    approved: true
  },
  {
    id: "attendance-2",
    worker: "Afsar Ali",
    shift: "Check-out pending",
    note: "Half day requested",
    approved: false
  }
];

export const drawerLinks = [
  { href: "/", label: "Home" },
  { href: "/carpenters", label: "Carpenters" },
  { href: "/jobs", label: "Jobs" },
  { href: "/bookings", label: "Bookings" },
  { href: "/profile", label: "Profile" },
  { href: "/my-account", label: "My Account" },
  { href: "/my-thekedar", label: "My Thekedar" },
  { href: "/my-karigar", label: "My Karigar" },
  { href: "/notifications", label: "Notifications" },
  { href: "/login", label: "Login" },
  { href: "/register", label: "Register" },
  { href: "/forgot-password", label: "Forgot Password" },
  { href: "/admin", label: "Admin" }
];

export const profileSections = [
  "Experience and skills",
  "Preferred work locations",
  "KYC documents",
  "Rate card",
  "Portfolio",
  "Language and support"
];

export const adminStats = [
  { label: "Pending KYC", value: "41" },
  { label: "Open disputes", value: "7" },
  { label: "Live bookings", value: "482" },
  { label: "Today's revenue", value: "₹86k" }
];

export const adminVerificationQueue = [
  {
    id: "kyc-101",
    name: "Rakesh Suthar",
    city: "Jaipur",
    skill: "Modular kitchen",
    status: "Pending review",
    risk: "Low"
  },
  {
    id: "kyc-102",
    name: "Afsar Ali",
    city: "Lucknow",
    skill: "Polish and fitting",
    status: "Documents unclear",
    risk: "Medium"
  },
  {
    id: "kyc-103",
    name: "Naveen Kumar",
    city: "Delhi NCR",
    skill: "Office furniture",
    status: "Aadhaar matched",
    risk: "Low"
  }
];

export const adminDisputes = [
  {
    id: "disp-201",
    title: "Attendance mismatch",
    subtitle: "Worker says full day, contractor marked half day",
    priority: "High",
    booking: "Retail shelving setup"
  },
  {
    id: "disp-202",
    title: "Final payment pending",
    subtitle: "Customer completed booking but final release pending 3 days",
    priority: "Medium",
    booking: "Kitchen repair visit"
  }
];

export const adminPayments = [
  {
    id: "pay-1",
    label: "Advance release",
    meta: "Booking booking-301 • ₹3,000 • Razorpay",
    status: "Success"
  },
  {
    id: "pay-2",
    label: "Final settlement",
    meta: "Booking booking-302 • ₹18,000 • Pending approval",
    status: "Action needed"
  },
  {
    id: "pay-3",
    label: "Refund request",
    meta: "Booking booking-303 • ₹1,200 • Review open",
    status: "Under review"
  }
];

export const adminAnalytics = [
  { label: "Top city demand", value: "Delhi NCR" },
  { label: "Top work model", value: "Daily wage" },
  { label: "Highest repeat hirers", value: "Interior contractors" },
  { label: "Approval SLA", value: "< 6 hours" }
];

export const adminModules = [
  "User management",
  "Carpenter KYC verification",
  "Jobs and applications moderation",
  "Attendance overrides",
  "Payments and settlements",
  "Reviews and disputes",
  "Notifications and analytics"
];

export const adminUsers = [
  {
    id: "user-1",
    name: "Rakesh Suthar",
    role: "Carpenter",
    city: "Jaipur",
    status: "Active"
  },
  {
    id: "user-2",
    name: "BuildEdge Interiors",
    role: "Contractor",
    city: "Delhi NCR",
    status: "Active"
  },
  {
    id: "user-3",
    name: "Seema Arora",
    role: "Customer",
    city: "Lucknow",
    status: "Flagged"
  }
];

export const adminBookings = [
  {
    id: "booking-301",
    title: "Wardrobe installation",
    city: "Jaipur",
    worker: "Rakesh Suthar",
    status: "Active",
    payment: "₹4,500 pending"
  },
  {
    id: "booking-302",
    title: "Retail shelving setup",
    city: "Delhi NCR",
    worker: "Afsar Ali",
    status: "Pending approval",
    payment: "₹18,000 settlement due"
  },
  {
    id: "booking-303",
    title: "Kitchen repair visit",
    city: "Lucknow",
    worker: "Naveen Kumar",
    status: "Completed",
    payment: "Paid"
  }
];
