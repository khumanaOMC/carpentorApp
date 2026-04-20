"use client";

import AssignmentTurnedInRoundedIcon from "@mui/icons-material/AssignmentTurnedInRounded";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import GavelRoundedIcon from "@mui/icons-material/GavelRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography
} from "@mui/material";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Pill } from "@/components/ui/pill";
import {
  createAdminBookingDemo,
  createAdminPaymentDemo,
  createAdminUserDemo,
  deleteAdminBooking,
  deleteAdminPayment,
  deleteAdminUser,
  approveAdminKyc,
  getAdminBookings,
  getAdminDashboard,
  getAdminKyc,
  getAdminPayments,
  getAdminUsers,
  rejectAdminKyc,
  updateAdminBookingStatus,
  updateAdminPaymentStatus,
  updateAdminUserStatus
} from "@/lib/api/admin";
import { clearAuthSession, getAuthUser } from "@/lib/auth-storage";

type WorkspaceKey = "overview" | "users" | "kyc" | "bookings" | "payments";

type AdminUser = {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role: string;
  status: string;
};

type AdminKyc = {
  id: string;
  name: string;
  city: string;
  skill: string;
  status: string;
  risk: string;
};

type AdminBooking = {
  id: string;
  title: string;
  city: string;
  worker: string;
  status: string;
  payment: string;
};

type AdminPayment = {
  id: string;
  label: string;
  meta: string;
  status: string;
};

const adminNavItems: Array<{ key: WorkspaceKey; label: string; icon: React.ReactNode }> = [
  { key: "overview", label: "Overview", icon: <DashboardRoundedIcon /> },
  { key: "users", label: "Users", icon: <PeopleRoundedIcon /> },
  { key: "kyc", label: "KYC Queue", icon: <VerifiedRoundedIcon /> },
  { key: "bookings", label: "Bookings", icon: <AssignmentTurnedInRoundedIcon /> },
  { key: "payments", label: "Payments", icon: <PaymentsRoundedIcon /> }
];

export function AdminScreen() {
  const router = useRouter();
  const authUser = getAuthUser();
  const [workspace, setWorkspace] = useState<WorkspaceKey>("overview");
  const [search, setSearch] = useState("");
  const [userRole, setUserRole] = useState("");
  const [userStatus, setUserStatus] = useState("");
  const [bookingStatus, setBookingStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [kycStatus, setKycStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [detailOpen, setDetailOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [selectedKyc, setSelectedKyc] = useState<AdminKyc | null>(null);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [stats, setStats] = useState([
    { label: "Total users", value: "0" },
    { label: "Pending KYC", value: "0" },
    { label: "Active bookings", value: "0" },
    { label: "Revenue", value: "₹0" }
  ]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [kycItems, setKycItems] = useState<AdminKyc[]>([]);
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [payments, setPayments] = useState<AdminPayment[]>([]);

  async function loadDashboard() {
    const response = await getAdminDashboard();
    setStats([
      { label: "Total users", value: String(response.stats.users) },
      { label: "Pending KYC", value: String(response.stats.pendingKyc) },
      { label: "Active bookings", value: String(response.stats.activeBookings) },
      { label: "Revenue", value: `₹${response.stats.revenue}` }
    ]);
  }

  async function loadUsers() {
    const response = await getAdminUsers({
      role: userRole || undefined,
      status: userStatus || undefined,
      search: search || undefined
    });
    setUsers(response.items);
  }

  async function loadKyc() {
    const response = await getAdminKyc({
      status: kycStatus || undefined,
      search: search || undefined
    });
    setKycItems(response.items);
  }

  async function loadBookings() {
    const response = await getAdminBookings({
      status: bookingStatus || undefined,
      search: search || undefined
    });
    setBookings(response.items);
  }

  async function loadPayments() {
    const response = await getAdminPayments({
      status: paymentStatus || undefined,
      search: search || undefined
    });
    setPayments(response.items);
  }

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        await loadDashboard();
        if (workspace === "users") await loadUsers();
        if (workspace === "kyc") await loadKyc();
        if (workspace === "bookings") await loadBookings();
        if (workspace === "payments") await loadPayments();
      } catch (error) {
        if (!cancelled) {
          if (error instanceof Error && /401|403|Authentication|session|Admin access/i.test(error.message)) {
            clearAuthSession();
            router.replace("/login?redirect=/admin");
            return;
          }

          setSnackbarMessage("Backend API connect nahi ho pa raha. Backend server check karo.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [workspace, search, userRole, userStatus, bookingStatus, paymentStatus, kycStatus, router]);

  const insightItems = useMemo(
    () => [
      "Top city demand: Delhi NCR",
      "Pending KYC under 6 hours target",
      "2 payments need manual settlement review"
    ],
    []
  );

  async function handleUserStatus(user: AdminUser) {
    setActionLoadingId(user.id);
    try {
      const nextStatus = user.status === "active" ? "blocked" : "active";
      await updateAdminUserStatus(user.id, nextStatus);
      await loadUsers();
      await loadDashboard();
      setSnackbarMessage("User status updated");
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleCreateUser() {
    setActionLoadingId("create-user");
    try {
      await createAdminUserDemo();
      await loadUsers();
      await loadDashboard();
      setSnackbarMessage("Demo user created");
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleDeleteUser(user: AdminUser) {
    setActionLoadingId(user.id);
    try {
      await deleteAdminUser(user.id);
      await loadUsers();
      await loadDashboard();
      setDetailOpen(false);
      setSnackbarMessage("User deleted");
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleApproveKyc(item: AdminKyc) {
    setActionLoadingId(item.id);
    try {
      await approveAdminKyc(item.id);
      await loadKyc();
      await loadDashboard();
      setDetailOpen(false);
      setSnackbarMessage("KYC approved");
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleRejectKyc(item: AdminKyc) {
    setActionLoadingId(item.id);
    try {
      await rejectAdminKyc(item.id);
      await loadKyc();
      await loadDashboard();
      setDetailOpen(false);
      setSnackbarMessage("KYC rejected");
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleBookingStatus(item: AdminBooking) {
    setActionLoadingId(item.id);
    try {
      const nextStatus =
        item.status === "Pending approval"
          ? "active"
          : item.status === "Active"
            ? "completed"
            : "completed";
      await updateAdminBookingStatus(item.id, nextStatus);
      await loadBookings();
      await loadDashboard();
      setSnackbarMessage("Booking status updated");
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleCreateBooking() {
    setActionLoadingId("create-booking");
    try {
      await createAdminBookingDemo();
      await loadBookings();
      await loadDashboard();
      setSnackbarMessage("Demo booking created");
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleDeleteBooking(item: AdminBooking) {
    setActionLoadingId(item.id);
    try {
      await deleteAdminBooking(item.id);
      await loadBookings();
      await loadDashboard();
      setSnackbarMessage("Booking deleted");
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handlePaymentStatus(item: AdminPayment) {
    setActionLoadingId(item.id);
    try {
      await updateAdminPaymentStatus(item.id, "success");
      await loadPayments();
      await loadDashboard();
      setPaymentOpen(false);
      setSnackbarMessage("Payment released");
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleCreatePayment() {
    setActionLoadingId("create-payment");
    try {
      await createAdminPaymentDemo();
      await loadPayments();
      await loadDashboard();
      setSnackbarMessage("Demo payment created");
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleDeletePayment(item: AdminPayment) {
    setActionLoadingId(item.id);
    try {
      await deleteAdminPayment(item.id);
      await loadPayments();
      await loadDashboard();
      setSnackbarMessage("Payment deleted");
    } finally {
      setActionLoadingId(null);
    }
  }

  function handleLogout() {
    clearAuthSession();
    router.replace("/login?redirect=/admin");
  }

  return (
    <>
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "background.default",
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "280px minmax(0, 1fr)" }
        }}
      >
        <Box
          sx={{
            borderRight: { md: "1px solid rgba(111,69,39,0.08)" },
            bgcolor: "rgba(255,250,244,0.96)",
            p: 2.5,
            display: "flex",
            flexDirection: "column",
            gap: 2
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar sx={{ bgcolor: "primary.main", width: 46, height: 46 }}>K</Avatar>
            <Box>
              <Typography fontWeight={700}>{authUser?.fullName || "KaamKaCarpenter"}</Typography>
              <Typography variant="body2" color="text.secondary">
                {authUser?.email || "Admin workspace"}
              </Typography>
            </Box>
          </Stack>

          <Card sx={{ bgcolor: "primary.main", color: "primary.contrastText" }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="subtitle1" fontWeight={700}>
                Operations live
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5, color: "rgba(255,250,244,0.82)" }}>
                Real backend-connected admin console for users, KYC, bookings and payments.
              </Typography>
            </CardContent>
          </Card>

          <List sx={{ p: 0 }}>
            {adminNavItems.map((item) => (
              <ListItemButton
                key={item.key}
                selected={workspace === item.key}
                onClick={() => setWorkspace(item.key)}
                sx={{ borderRadius: 3, mb: 0.5 }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            ))}
          </List>

          <Divider />

          <Typography variant="subtitle2" color="text.secondary">
            Quick modules
          </Typography>
          <Pill label="User management" tone="outlined" />
          <Pill label="Carpenter KYC verification" tone="outlined" />
          <Pill label="Payments and settlements" tone="outlined" />
          <Pill label="Bookings moderation" tone="outlined" />

          <Box sx={{ mt: "auto" }}>
            <Button fullWidth variant="outlined" startIcon={<LogoutRoundedIcon />} onClick={handleLogout}>
              Logout
            </Button>
          </Box>
        </Box>

        <Box sx={{ p: { xs: 2, md: 3 } }}>
          <Stack spacing={2.2}>
            <Card
              sx={{
                background:
                  "linear-gradient(145deg, rgba(255,250,244,1), rgba(239,224,207,0.82))"
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Stack
                  direction={{ xs: "column", md: "row" }}
                  justifyContent="space-between"
                  alignItems={{ xs: "flex-start", md: "center" }}
                  spacing={2}
                >
                  <Box>
                    <Typography variant="h5">Admin Control Center</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      Backend API se connected filters, tables aur CRUD actions.
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    <Pill label="KYC Live" tone="filled" />
                    <Pill label="Backend CRUD" />
                    <Pill label="Tables + Filters" />
                  </Stack>
                </Stack>
              </CardContent>
            </Card>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", md: "repeat(4, minmax(0, 1fr))" },
                gap: 1.5
              }}
            >
              {stats.map((stat) => (
                <Card key={stat.label}>
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      {stat.label}
                    </Typography>
                    <Typography variant="h4" sx={{ mt: 1 }}>
                      {stat.value}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>

            <Stack direction={{ xs: "column", lg: "row" }} spacing={2}>
              <Box sx={{ flex: 1.35, minWidth: 0 }}>
                <Card sx={{ mb: 2 }}>
                  <CardContent sx={{ p: 2 }}>
                    <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
                      <TextField
                        fullWidth
                        label="Search"
                        placeholder="Search name, city, skill..."
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                      />
                      {workspace === "users" ? (
                        <>
                          <TextField
                            select
                            label="Role"
                            value={userRole}
                            onChange={(event) => setUserRole(event.target.value)}
                            sx={{ minWidth: 150 }}
                          >
                            <MenuItem value="">All</MenuItem>
                            <MenuItem value="carpenter">Carpenter</MenuItem>
                            <MenuItem value="contractor">Contractor</MenuItem>
                            <MenuItem value="customer">Customer</MenuItem>
                            <MenuItem value="admin">Admin</MenuItem>
                          </TextField>
                          <TextField
                            select
                            label="Status"
                            value={userStatus}
                            onChange={(event) => setUserStatus(event.target.value)}
                            sx={{ minWidth: 150 }}
                          >
                            <MenuItem value="">All</MenuItem>
                            <MenuItem value="active">Active</MenuItem>
                            <MenuItem value="blocked">Blocked</MenuItem>
                            <MenuItem value="pending">Pending</MenuItem>
                          </TextField>
                        </>
                      ) : null}

                      {workspace === "kyc" ? (
                        <TextField
                          select
                          label="KYC Status"
                          value={kycStatus}
                          onChange={(event) => setKycStatus(event.target.value)}
                          sx={{ minWidth: 180 }}
                        >
                          <MenuItem value="">All</MenuItem>
                          <MenuItem value="pending">Pending</MenuItem>
                          <MenuItem value="approved">Approved</MenuItem>
                          <MenuItem value="rejected">Rejected</MenuItem>
                        </TextField>
                      ) : null}

                      {workspace === "bookings" ? (
                        <TextField
                          select
                          label="Booking Status"
                          value={bookingStatus}
                          onChange={(event) => setBookingStatus(event.target.value)}
                          sx={{ minWidth: 180 }}
                        >
                          <MenuItem value="">All</MenuItem>
                          <MenuItem value="pending">Pending</MenuItem>
                          <MenuItem value="active">Active</MenuItem>
                          <MenuItem value="completed">Completed</MenuItem>
                        </TextField>
                      ) : null}

                      {workspace === "payments" ? (
                        <TextField
                          select
                          label="Payment Status"
                          value={paymentStatus}
                          onChange={(event) => setPaymentStatus(event.target.value)}
                          sx={{ minWidth: 180 }}
                        >
                          <MenuItem value="">All</MenuItem>
                          <MenuItem value="created">Created</MenuItem>
                          <MenuItem value="success">Success</MenuItem>
                          <MenuItem value="under_review">Under review</MenuItem>
                        </TextField>
                      ) : null}
                    </Stack>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent sx={{ p: 2 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                      <Typography variant="h6">
                        {workspace === "overview" ? "Overview" : workspace.charAt(0).toUpperCase() + workspace.slice(1)}
                      </Typography>
                      {loading ? <CircularProgress size={24} /> : null}
                    </Stack>

                    {workspace === "overview" ? (
                      <Stack spacing={2}>
                        <Typography variant="body2" color="text.secondary">
                          Sidebar se module select karke backend-connected tables aur actions use karo.
                        </Typography>
                        <Stack spacing={1}>
                          <Button variant="contained" onClick={() => setWorkspace("users")}>
                            Open users table
                          </Button>
                          <Button variant="outlined" onClick={() => setWorkspace("kyc")}>
                            Open KYC queue
                          </Button>
                          <Button variant="outlined" onClick={() => setWorkspace("bookings")}>
                            Open bookings table
                          </Button>
                          <Button variant="outlined" onClick={() => setWorkspace("payments")}>
                            Open payments table
                          </Button>
                        </Stack>
                      </Stack>
                    ) : null}

                    {workspace === "users" ? (
                      <Stack spacing={1.5}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="body2" color="text.secondary">
                            Backend-connected users table
                          </Typography>
                          <Button
                            variant="contained"
                            disabled={actionLoadingId === "create-user"}
                            onClick={handleCreateUser}
                          >
                            Add demo user
                          </Button>
                        </Stack>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Name</TableCell>
                              <TableCell>Role</TableCell>
                              <TableCell>Status</TableCell>
                              <TableCell align="right">Action</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {users.map((item) => (
                              <TableRow key={item.id} hover>
                                <TableCell>
                                  <Typography fontWeight={600}>{item.name}</Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {item.email}
                                  </Typography>
                                </TableCell>
                                <TableCell>{item.role}</TableCell>
                                <TableCell>
                                  <Pill
                                    label={item.status}
                                    tone={item.status === "active" ? "success" : item.status === "blocked" ? "warning" : "soft"}
                                  />
                                </TableCell>
                                <TableCell align="right">
                                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                                    <Button size="small" onClick={() => {
                                      setSelectedUser(item);
                                      setSelectedKyc(null);
                                      setDetailOpen(true);
                                    }}>
                                      View
                                    </Button>
                                    <Button
                                      size="small"
                                      variant="contained"
                                      disabled={actionLoadingId === item.id}
                                      onClick={() => handleUserStatus(item)}
                                    >
                                      Toggle
                                    </Button>
                                    <Button
                                      size="small"
                                      color="error"
                                      disabled={actionLoadingId === item.id}
                                      onClick={() => handleDeleteUser(item)}
                                    >
                                      Delete
                                    </Button>
                                  </Stack>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </Stack>
                    ) : null}

                    {workspace === "kyc" ? (
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Carpenter</TableCell>
                            <TableCell>City</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell align="right">Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {kycItems.map((item) => (
                            <TableRow key={item.id} hover>
                              <TableCell>
                                <Typography fontWeight={600}>{item.name}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {item.skill}
                                </Typography>
                              </TableCell>
                              <TableCell>{item.city}</TableCell>
                              <TableCell>
                                <Pill label={item.status} tone="outlined" />
                              </TableCell>
                              <TableCell align="right">
                                <Stack direction="row" spacing={1} justifyContent="flex-end">
                                  <Button size="small" onClick={() => {
                                    setSelectedKyc(item);
                                    setSelectedUser(null);
                                    setDetailOpen(true);
                                  }}>
                                    Review
                                  </Button>
                                  <Button
                                    size="small"
                                    variant="contained"
                                    disabled={actionLoadingId === item.id}
                                    onClick={() => handleApproveKyc(item)}
                                  >
                                    Approve
                                  </Button>
                                </Stack>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : null}

                    {workspace === "bookings" ? (
                      <Stack spacing={1.5}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="body2" color="text.secondary">
                            Bookings CRUD
                          </Typography>
                          <Button
                            variant="contained"
                            disabled={actionLoadingId === "create-booking"}
                            onClick={handleCreateBooking}
                          >
                            Add demo booking
                          </Button>
                        </Stack>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Booking</TableCell>
                              <TableCell>Worker</TableCell>
                              <TableCell>Status</TableCell>
                              <TableCell align="right">Action</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {bookings.map((item) => (
                              <TableRow key={item.id} hover>
                                <TableCell>
                                  <Typography fontWeight={600}>{item.title}</Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {item.city} • {item.payment}
                                  </Typography>
                                </TableCell>
                                <TableCell>{item.worker}</TableCell>
                                <TableCell>
                                  <Pill
                                    label={item.status}
                                    tone={item.status === "Completed" ? "success" : item.status === "Active" ? "soft" : "warning"}
                                  />
                                </TableCell>
                                <TableCell align="right">
                                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                                    <Button
                                      size="small"
                                      variant="contained"
                                      disabled={actionLoadingId === item.id}
                                      onClick={() => handleBookingStatus(item)}
                                    >
                                      Update
                                    </Button>
                                    <Button
                                      size="small"
                                      color="error"
                                      disabled={actionLoadingId === item.id}
                                      onClick={() => handleDeleteBooking(item)}
                                    >
                                      Delete
                                    </Button>
                                  </Stack>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </Stack>
                    ) : null}

                    {workspace === "payments" ? (
                      <Stack spacing={1.5}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="body2" color="text.secondary">
                            Payments CRUD
                          </Typography>
                          <Button
                            variant="contained"
                            disabled={actionLoadingId === "create-payment"}
                            onClick={handleCreatePayment}
                          >
                            Add demo payment
                          </Button>
                        </Stack>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Payment</TableCell>
                              <TableCell>Status</TableCell>
                              <TableCell align="right">Action</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {payments.map((item) => (
                              <TableRow key={item.id} hover>
                                <TableCell>
                                  <Typography fontWeight={600}>{item.label}</Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {item.meta}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Pill
                                    label={item.status}
                                    tone={item.status === "Success" ? "success" : item.status === "Action needed" ? "warning" : "outlined"}
                                  />
                                </TableCell>
                                <TableCell align="right">
                                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                                    <Button size="small" onClick={() => setPaymentOpen(true)}>
                                      Open
                                    </Button>
                                    <Button
                                      size="small"
                                      variant="contained"
                                      disabled={actionLoadingId === item.id}
                                      onClick={() => handlePaymentStatus(item)}
                                    >
                                      Mark paid
                                    </Button>
                                    <Button
                                      size="small"
                                      color="error"
                                      disabled={actionLoadingId === item.id}
                                      onClick={() => handleDeletePayment(item)}
                                    >
                                      Delete
                                    </Button>
                                  </Stack>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </Stack>
                    ) : null}
                  </CardContent>
                </Card>
              </Box>

              <Box sx={{ width: { xs: "100%", lg: 360 }, flexShrink: 0 }}>
                <Card sx={{ height: "100%" }}>
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
                      Admin Insight Rail
                    </Typography>
                    <Stack spacing={1.5}>
                      {insightItems.map((item) => (
                        <Stack key={item} direction="row" spacing={1} alignItems="center">
                          {item.includes("payment") ? (
                            <WarningAmberRoundedIcon color="warning" />
                          ) : (
                            <VisibilityRoundedIcon color="primary" />
                          )}
                          <Typography variant="body2">{item}</Typography>
                        </Stack>
                      ))}
                      <Divider />
                      <Typography variant="body2" color="text.secondary">
                        Admin page ab backend API se data fetch karti hai aur tables/filter/action
                        based hai. Ye mobile shell se separate dedicated console hai.
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Box>
            </Stack>
          </Stack>
        </Box>
      </Box>

      <Drawer anchor="right" open={detailOpen} onClose={() => setDetailOpen(false)}>
        <Box sx={{ width: 360, p: 2.5 }}>
          {selectedKyc ? (
            <>
              <Typography variant="h6">KYC Review Detail</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Carpenter verification details
              </Typography>
              <Stack spacing={1.5}>
                <Pill label={selectedKyc.name} tone="filled" />
                <Divider />
                <Typography variant="body2">City: {selectedKyc.city}</Typography>
                <Typography variant="body2">Skill: {selectedKyc.skill}</Typography>
                <Typography variant="body2">Status: {selectedKyc.status}</Typography>
                <Typography variant="body2">Risk: {selectedKyc.risk}</Typography>
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="contained"
                    fullWidth
                    disabled={actionLoadingId === selectedKyc.id}
                    onClick={() => handleApproveKyc(selectedKyc)}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    fullWidth
                    disabled={actionLoadingId === selectedKyc.id}
                    onClick={() => handleRejectKyc(selectedKyc)}
                  >
                    Reject
                  </Button>
                </Stack>
              </Stack>
            </>
          ) : null}

          {selectedUser ? (
            <>
              <Typography variant="h6">User Detail</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                User role, contact aur status management
              </Typography>
              <Stack spacing={1.5}>
                <Pill label={selectedUser.name} tone="filled" />
                <Divider />
                <Typography variant="body2">Role: {selectedUser.role}</Typography>
                <Typography variant="body2">Email: {selectedUser.email}</Typography>
                <Typography variant="body2">Mobile: {selectedUser.mobile}</Typography>
                <Typography variant="body2">Status: {selectedUser.status}</Typography>
                <Button
                  variant="contained"
                  disabled={actionLoadingId === selectedUser.id}
                  onClick={() => handleUserStatus(selectedUser)}
                >
                  Toggle user status
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  disabled={actionLoadingId === selectedUser.id}
                  onClick={() => handleDeleteUser(selectedUser)}
                >
                  Delete user
                </Button>
              </Stack>
            </>
          ) : null}
        </Box>
      </Drawer>

      <Dialog open={paymentOpen} onClose={() => setPaymentOpen(false)} fullWidth>
        <DialogTitle>Payment Action Center</DialogTitle>
        <DialogContent>
          <Stack spacing={1.25} sx={{ pt: 0.5 }}>
            <Typography variant="body2" color="text.secondary">
              Yahan admin payout release aur settlement confirmation kar sakta hai.
            </Typography>
            {payments.map((item) => (
              <Stack key={item.id} direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body2">{item.label}</Typography>
                <Button size="small" onClick={() => handlePaymentStatus(item)}>
                  Run action
                </Button>
              </Stack>
            ))}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={Boolean(snackbarMessage)}
        autoHideDuration={2500}
        onClose={() => setSnackbarMessage("")}
        message={snackbarMessage}
      />
    </>
  );
}
