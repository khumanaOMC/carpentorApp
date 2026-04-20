"use client";

import GoogleIcon from "@mui/icons-material/Google";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  MenuItem,
  Snackbar,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { registerUser } from "@/lib/api/marketplace";
import { saveAuthSession } from "@/lib/auth-storage";
import { getSelectedLanguage, type AppLanguage } from "@/lib/app-preferences";

const roles = [
  { value: "carpenter", label: "Carpenter" },
  { value: "contractor", label: "Contractor / Thekedaar" },
  { value: "customer", label: "Customer" }
];

type RegisterForm = {
  fullName: string;
  email: string;
  mobile: string;
  password: string;
  role: "carpenter" | "contractor" | "customer";
  language: AppLanguage;
  city: string;
  state: string;
  pincode: string;
  bio: string;
  experienceYears: string;
  skills: string;
  availabilityStatus: "available" | "busy" | "outstation";
  dailyRate: string;
  halfDayRate: string;
  oneAndHalfDayRate: string;
  monthlyRate: string;
  overtimeRate: string;
};

export function AuthCard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState<RegisterForm>({
    fullName: "",
    email: "",
    mobile: "",
    password: "",
    role: "carpenter",
    language: "hi",
    city: "",
    state: "",
    pincode: "",
    bio: "",
    experienceYears: "",
    skills: "",
    availabilityStatus: "available",
    dailyRate: "",
    halfDayRate: "",
    oneAndHalfDayRate: "",
    monthlyRate: "",
    overtimeRate: ""
  });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  function updateField<K extends keyof RegisterForm>(field: K, value: RegisterForm[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  useEffect(() => {
    const storedLanguage = getSelectedLanguage();
    const queryRole = searchParams.get("role");

    if (storedLanguage) {
      setForm((current) => ({ ...current, language: storedLanguage }));
    }

    if (queryRole === "carpenter" || queryRole === "contractor" || queryRole === "customer") {
      setForm((current) => ({ ...current, role: queryRole }));
    }
  }, [searchParams]);

  async function submitRegistration() {
    setSubmitting(true);
    setErrorMessage("");

    try {
      const response = await registerUser({
        fullName: form.fullName,
        email: form.email,
        mobile: form.mobile,
        password: form.password,
        role: form.role,
        language: form.language,
        city: form.city,
        state: form.state,
        pincode: form.pincode,
        bio: form.bio,
        experienceYears: Number(form.experienceYears || 0),
        skills: form.skills
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        availabilityStatus: form.availabilityStatus,
        dailyRate: Number(form.dailyRate || 0),
        halfDayRate: Number(form.halfDayRate || 0),
        oneAndHalfDayRate: Number(form.oneAndHalfDayRate || 0),
        monthlyRate: Number(form.monthlyRate || 0),
        overtimeRate: Number(form.overtimeRate || 0)
      });
      saveAuthSession(response.token, response.user);
      setSnackbarMessage("Account create ho gaya. Contact ya connect karne se pehle plan activate kar lena.");
      setSnackbarOpen(true);
      router.replace(response.user.role === "admin" ? "/admin" : "/");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Registration failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Card>
        <CardContent sx={{ p: 2.25 }}>
          <Stack spacing={2}>
            <Box>
              <Typography variant="h6">Simple onboarding</Typography>
              <Typography variant="body2" color="text.secondary">
                Pehle normal register karo. Plan baad me My Account se activate kar sakte ho.
              </Typography>
            </Box>
            <Alert severity="info" sx={{ borderRadius: 3 }}>
              Register ke baad login hoga. Contact, chat, booking ya request bhejne se pehle active plan zaroori hoga.
            </Alert>
            {errorMessage ? <Alert severity="error" sx={{ borderRadius: 3 }}>{errorMessage}</Alert> : null}
            <TextField
              label="Full Name"
              fullWidth
              value={form.fullName}
              onChange={(event) => updateField("fullName", event.target.value)}
            />
            <TextField
              label="Email Address"
              type="email"
              fullWidth
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
            />
            <TextField
              label="Mobile Number"
              fullWidth
              value={form.mobile}
              onChange={(event) => updateField("mobile", event.target.value)}
            />
            <TextField
              label="Password"
              type="password"
              fullWidth
              value={form.password}
              onChange={(event) => updateField("password", event.target.value)}
            />
            <TextField
              select
              label="Select Role"
              value={form.role}
              fullWidth
              onChange={(event) => updateField("role", event.target.value as RegisterForm["role"])}
            >
              {roles.map((role) => (
                <MenuItem key={role.value} value={role.value}>
                  {role.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="App language"
              value={form.language}
              fullWidth
              onChange={(event) => updateField("language", event.target.value as AppLanguage)}
            >
              <MenuItem value="hi">Hindi</MenuItem>
              <MenuItem value="en">English</MenuItem>
              <MenuItem value="ta">Tamil</MenuItem>
              <MenuItem value="kn">Kannada</MenuItem>
            </TextField>
            <TextField
              label="City"
              fullWidth
              value={form.city}
              onChange={(event) => updateField("city", event.target.value)}
            />
            <TextField
              label="State"
              fullWidth
              value={form.state}
              onChange={(event) => updateField("state", event.target.value)}
            />
            <TextField
              label="PIN code"
              fullWidth
              value={form.pincode}
              onChange={(event) => updateField("pincode", event.target.value)}
            />
            <TextField
              label="About / Bio"
              fullWidth
              multiline
              minRows={2}
              value={form.bio}
              onChange={(event) => updateField("bio", event.target.value)}
            />
            {form.role === "carpenter" ? (
              <>
                <TextField
                  label="Experience years"
                  fullWidth
                  value={form.experienceYears}
                  onChange={(event) => updateField("experienceYears", event.target.value)}
                />
                <TextField
                  label="Kaam kya kya aata hai"
                  placeholder="Modular kitchen, polish, almirah fitting, door fitting"
                  fullWidth
                  multiline
                  minRows={2}
                  value={form.skills}
                  onChange={(event) => updateField("skills", event.target.value)}
                />
                <TextField
                  select
                  label="Availability"
                  value={form.availabilityStatus}
                  fullWidth
                  onChange={(event) => updateField("availabilityStatus", event.target.value as RegisterForm["availabilityStatus"])}
                >
                  <MenuItem value="available">Available</MenuItem>
                  <MenuItem value="busy">Busy</MenuItem>
                  <MenuItem value="outstation">Outstation</MenuItem>
                </TextField>
                <TextField
                  label="Half day rate"
                  fullWidth
                  value={form.halfDayRate}
                  onChange={(event) => updateField("halfDayRate", event.target.value)}
                />
                <TextField
                  label="1 day rate"
                  fullWidth
                  value={form.dailyRate}
                  onChange={(event) => updateField("dailyRate", event.target.value)}
                />
                <TextField
                  label="1.5 day rate"
                  fullWidth
                  value={form.oneAndHalfDayRate}
                  onChange={(event) => updateField("oneAndHalfDayRate", event.target.value)}
                />
                <TextField
                  label="Monthly rate"
                  fullWidth
                  value={form.monthlyRate}
                  onChange={(event) => updateField("monthlyRate", event.target.value)}
                />
                <TextField
                  label="Overtime per hour"
                  fullWidth
                  value={form.overtimeRate}
                  onChange={(event) => updateField("overtimeRate", event.target.value)}
                />
              </>
            ) : null}
            <Stack spacing={1}>
              <Button variant="contained" fullWidth onClick={submitRegistration} disabled={submitting}>
                {submitting ? "Creating account..." : "Register"}
              </Button>
              <Button variant="outlined" startIcon={<GoogleIcon />} fullWidth>
                Continue with Google
              </Button>
            </Stack>
            <Divider />
            <Typography variant="body2" color="text.secondary">
              Existing user? Email aur password se login karo aur profile continue karo.
            </Typography>
          </Stack>
        </CardContent>
      </Card>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2500}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage || `Registration complete for ${form.role}`}
      />
    </>
  );
}
