"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Alert, Button, Card, CardContent, Snackbar, Stack, Typography } from "@mui/material";
import { MobileShell } from "@/components/app-shell/mobile-shell";
import { getCurrentUser } from "@/lib/api/auth";
import { clearAuthSession } from "@/lib/auth-storage";
import { getMyPlan, updateMyPlan } from "@/lib/api/account";
import { PlanSelector } from "@/components/plans/plan-selector";

export function MyAccountScreen() {
  const [user, setUser] = useState<{
    fullName: string;
    email: string;
    mobile: string;
    role: "carpenter" | "contractor" | "customer" | "admin";
    status: string;
    selectedPlan?: "basic" | "standard" | "pro";
    billingCycle?: "monthly" | "yearly";
    planStatus?: "active" | "pending" | "cancelled";
  } | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<"basic" | "standard" | "pro">("basic");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [planHistory, setPlanHistory] = useState<Array<{
    plan: "basic" | "standard" | "pro";
    billingCycle: "monthly" | "yearly";
    status: "active" | "pending" | "cancelled";
    changedAt?: string;
  }>>([]);
  const [message, setMessage] = useState("");
  const [savingPlan, setSavingPlan] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  useEffect(() => {
    let active = true;
    getCurrentUser()
      .then((response) => {
        if (active) {
          setUser({
            fullName: response.user.fullName,
            email: response.user.email,
            mobile: response.user.mobile,
            role: response.user.role as "carpenter" | "contractor" | "customer" | "admin",
            status: response.user.status,
            selectedPlan: response.user.selectedPlan,
            billingCycle: response.user.billingCycle,
            planStatus: response.user.planStatus
          });
          setSelectedPlan((response.user.selectedPlan as "basic" | "standard" | "pro") || "basic");
          setBillingCycle((response.user.billingCycle as "monthly" | "yearly") || "monthly");
        }
      })
      .catch((error) => {
        if (active) setMessage(error instanceof Error ? error.message : "Account load nahi hua.");
      });

    getMyPlan()
      .then((response) => {
        if (active) {
          setSelectedPlan(response.plan.selectedPlan);
          setBillingCycle(response.plan.billingCycle);
          setPlanHistory(response.plan.history || []);
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  async function savePlan() {
    try {
      setSavingPlan(true);
      const response = await updateMyPlan({
        selectedPlan,
        billingCycle
      });
      setPlanHistory(response.plan.history || []);
      setUser((current) =>
        current
          ? {
              ...current,
              selectedPlan: response.plan.selectedPlan,
              billingCycle: response.plan.billingCycle,
              planStatus: response.plan.status
            }
          : current
      );
      setSnackbarOpen(true);
      setMessage("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Plan update nahi hua.");
    } finally {
      setSavingPlan(false);
    }
  }

  return (
    <>
    <MobileShell title="My Account" subtitle="Login, account aur role overview">
      <Stack spacing={2}>
        {message ? <Alert severity="error">{message}</Alert> : null}
        <Card>
          <CardContent sx={{ p: 2 }}>
            <Stack spacing={1}>
              <Typography variant="h6">{user?.fullName || "Guest user"}</Typography>
              <Typography variant="body2" color="text.secondary">{user?.email || "Login required"}</Typography>
              <Typography variant="body2" color="text.secondary">{user?.mobile || "-"}</Typography>
              <Typography variant="body2" color="primary.main">Role: {user?.role || "guest"} • Status: {user?.status || "-"}</Typography>
              <Typography variant="body2" color="text.secondary">
                Current plan: {user?.selectedPlan || selectedPlan} • {user?.billingCycle || billingCycle} • {user?.planStatus || "active"}
              </Typography>
            </Stack>
          </CardContent>
        </Card>
        {user && user.role !== "admin" ? (
          <Card>
            <CardContent sx={{ p: 2 }}>
              <Stack spacing={1.5}>
                <Typography variant="h6">My Plan</Typography>
                <PlanSelector
                  role={user.role}
                  selectedPlan={selectedPlan}
                  onPlanChange={setSelectedPlan}
                />
                <Stack direction="row" spacing={1}>
                  <Button
                    variant={billingCycle === "monthly" ? "contained" : "outlined"}
                    fullWidth
                    onClick={() => setBillingCycle("monthly")}
                  >
                    Monthly
                  </Button>
                  <Button
                    variant={billingCycle === "yearly" ? "contained" : "outlined"}
                    fullWidth
                    onClick={() => setBillingCycle("yearly")}
                  >
                    Yearly
                  </Button>
                </Stack>
                <Button variant="contained" fullWidth onClick={savePlan} disabled={savingPlan}>
                  {savingPlan ? "Updating..." : "Update Plan"}
                </Button>
              </Stack>
            </CardContent>
          </Card>
        ) : null}
        {planHistory.length ? (
          <Card>
            <CardContent sx={{ p: 2 }}>
              <Stack spacing={1}>
                <Typography variant="h6">Plan History</Typography>
                {planHistory.map((item, index) => (
                  <Typography key={`${item.plan}-${index}`} variant="body2" color="text.secondary">
                    {item.plan} • {item.billingCycle} • {item.status}
                  </Typography>
                ))}
              </Stack>
            </CardContent>
          </Card>
        ) : null}
        {user?.role === "carpenter" ? (
          <Button component={Link} href="/my-thekedar" variant="contained" fullWidth>
            My Thekedar
          </Button>
        ) : null}
        {user?.role === "contractor" || user?.role === "customer" ? (
          <Button component={Link} href="/my-karigar" variant="outlined" fullWidth>
            My Karigar
          </Button>
        ) : null}
        <Button component={Link} href="/profile" variant="outlined" fullWidth>
          Edit Profile
        </Button>
        <Button
          variant="text"
          color="inherit"
          fullWidth
          onClick={() => {
            clearAuthSession();
            window.location.href = "/login";
          }}
        >
          Logout
        </Button>
      </Stack>
    </MobileShell>
    <Snackbar
      open={snackbarOpen}
      autoHideDuration={2200}
      onClose={() => setSnackbarOpen(false)}
      message="Plan updated"
    />
    </>
  );
}
