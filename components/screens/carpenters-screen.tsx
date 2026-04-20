"use client";

import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { MobileShell } from "@/components/app-shell/mobile-shell";
import { Pill } from "@/components/ui/pill";
import { getAuthUser } from "@/lib/auth-storage";
import { getCarpenters, type CarpenterDirectoryItem } from "@/lib/api/profile";
import { createBooking } from "@/lib/api/marketplace";
import { useAppLanguage } from "@/components/providers/app-language-provider";
import { appDictionary } from "@/lib/i18n";
import { getCarpenterPublicProfile } from "@/lib/api/trust";
import { getConnectAccessState, getContactLockMessage, hasActivePlan } from "@/lib/plan-access";

export function CarpentersScreen() {
  const { language } = useAppLanguage();
  const dictionary = appDictionary[language];
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [availabilityStatus, setAvailabilityStatus] = useState("");
  const [carpenters, setCarpenters] = useState<CarpenterDirectoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedCarpenter, setSelectedCarpenter] = useState<null | Awaited<ReturnType<typeof getCarpenterPublicProfile>>["item"]>(null);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingCarpenter, setBookingCarpenter] = useState<CarpenterDirectoryItem | null>(null);
  const [rateModel, setRateModel] = useState("full_day");
  const [agreedRate, setAgreedRate] = useState("");
  const authUser = getAuthUser();
  const canContact = hasActivePlan(authUser);

  function ensureConnectAccess(actionLabel: string) {
    const gate = getConnectAccessState(authUser, "/carpenters");
    if (gate.allowed) {
      return true;
    }

    setMessage(`${actionLabel}: ${gate.message}`);
    if (gate.redirectTo) {
      router.push(gate.redirectTo);
    }
    return false;
  }

  useEffect(() => {
    let active = true;

    async function loadCarpenters() {
      setLoading(true);
      try {
        const response = await getCarpenters({
          search: search || undefined,
          availabilityStatus: availabilityStatus || undefined
        });

        if (active) {
          setCarpenters(response.items);
        }
      } catch (error) {
        if (active) {
          setMessage(error instanceof Error ? error.message : "Carpenters load nahi hue.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadCarpenters();
    return () => {
      active = false;
    };
  }, [search, availabilityStatus]);

  const emptyMessage = useMemo(() => {
    if (loading) return "";
    if (carpenters.length === 0) return "Is filter ke liye abhi carpenter nahi mila.";
    return "";
  }, [carpenters.length, loading]);

  function requireLogin(action: "book" | "contact") {
    if (!authUser) {
      router.push("/login?redirect=/carpenters");
      return;
    }

    if (action === "book" && !["contractor", "customer"].includes(authUser.role)) {
      setMessage("Booking request sirf thekedar ya customer bhej sakte hain.");
      return;
    }

    setMessage(
      action === "book"
        ? dictionary.carpenters.bookingNext
        : dictionary.carpenters.contactNext
    );
  }

  function openBookingDialog(item: CarpenterDirectoryItem) {
    if (!ensureConnectAccess("Booking request")) {
      return;
    }

    const currentUser = authUser;
    if (!currentUser) {
      return;
    }

    if (!["contractor", "customer"].includes(currentUser.role)) {
      setMessage("Booking request sirf thekedar ya customer bhej sakte hain.");
      return;
    }

    setBookingCarpenter(item);
    setRateModel("full_day");
    setAgreedRate(String(item.rateCard?.fullDay || item.rateCard?.daily || 0));
    setBookingOpen(true);
  }

  async function handleBookingRequest() {
    if (!bookingCarpenter) {
      return;
    }

    const parsedRate = Number(agreedRate);
    if (!parsedRate || parsedRate <= 0) {
      setMessage("Valid rate enter karo.");
      return;
    }

    setBookingLoading(true);
    try {
      await createBooking({
        carpenterId: bookingCarpenter.id,
        rateModel,
        agreedRate: parsedRate
      });
      setBookingOpen(false);
      setMessage("Karigar ko booking request bhej di gayi. Accept karne ke baad woh My Karigar me dikh jayega.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Booking request nahi gayi.");
    } finally {
      setBookingLoading(false);
    }
  }

  async function openCarpenterDetail(id: string) {
    setDetailLoading(true);
    setDetailOpen(true);
    try {
      const response = await getCarpenterPublicProfile(id);
      setSelectedCarpenter(response.item);
      setMessage("");
    } catch (error) {
      setSelectedCarpenter(null);
      setMessage(error instanceof Error ? error.message : "Karigar detail load nahi hui.");
    } finally {
      setDetailLoading(false);
    }
  }

  return (
    <MobileShell title="Carpenters" subtitle="Search verified workers by city, skill and availability">
      <Stack spacing={2}>
        <TextField
          fullWidth
          placeholder={dictionary.carpenters.searchPlaceholder}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon color="action" />
              </InputAdornment>
            )
          }}
        />
        <TextField
          select
          fullWidth
          label={dictionary.carpenters.availability}
          value={availabilityStatus}
          onChange={(event) => setAvailabilityStatus(event.target.value)}
        >
          <MenuItem value="">{dictionary.carpenters.all}</MenuItem>
          <MenuItem value="available">{dictionary.carpenters.available}</MenuItem>
          <MenuItem value="busy">{dictionary.carpenters.busy}</MenuItem>
          <MenuItem value="outstation">{dictionary.carpenters.outstation}</MenuItem>
        </TextField>

        {loading ? <CircularProgress size={26} /> : null}

        <Stack spacing={1.5}>
          {carpenters.map((item) => (
            <Card key={item.id}>
              <CardContent sx={{ p: 2 }}>
                <Stack spacing={1.25}>
                  <Stack direction="row" justifyContent="space-between" gap={1}>
                    <Stack direction="row" spacing={1.25} alignItems="center">
                      <Avatar
                        src={item.profilePhotoUrl || undefined}
                        sx={{ width: 52, height: 52, bgcolor: "primary.main" }}
                      >
                        {item.fullName.split(" ").map((part) => part[0]).slice(0, 2).join("")}
                      </Avatar>
                      <div>
                        <Typography variant="subtitle1" fontWeight={700}>
                          {item.fullName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {item.city}, {item.state} • {item.experienceYears} {dictionary.carpenters.yearsExp}
                        </Typography>
                      </div>
                    </Stack>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <StarRoundedIcon sx={{ fontSize: 18, color: "warning.main" }} />
                      <Typography fontWeight={700}>{item.averageRating.toFixed(1)}</Typography>
                    </Stack>
                  </Stack>

                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    <Pill label={item.availabilityStatus} tone={item.availabilityStatus === "available" ? "success" : "soft"} />
                    <Pill label={item.kycStatus === "approved" ? dictionary.home.kycVerified : dictionary.home.kycPending} tone={item.kycStatus === "approved" ? "success" : "warning"} />
                    {(item.skills || []).slice(0, 3).map((skill) => (
                      <Pill key={skill} label={skill} tone="outlined" />
                    ))}
                  </Stack>

                  <Typography variant="body2" color="primary.main" fontWeight={700}>
                    {dictionary.carpenters.daily} ₹{item.rateCard?.daily || 0} • {dictionary.carpenters.halfDay} ₹{item.rateCard?.halfDay || 0}
                  </Typography>

                  {item.portfolioItems?.length ? (
                    <Typography variant="body2" color="text.secondary">
                      {dictionary.carpenters.portfolio}: {item.portfolioItems.length} {item.portfolioItems.length > 1 ? dictionary.carpenters.mediaItems : dictionary.carpenters.mediaItem}
                    </Typography>
                  ) : null}

                  <Stack direction="row" spacing={1}>
                    <Button variant="contained" fullWidth onClick={() => openCarpenterDetail(item.id)}>
                      View details
                    </Button>
                    <Button variant="outlined" fullWidth onClick={() => openBookingDialog(item)}>
                      {dictionary.carpenters.book}
                    </Button>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>

        {emptyMessage ? (
          <Typography variant="body2" color="text.secondary">
            {dictionary.carpenters.empty}
          </Typography>
        ) : null}
        {message ? (
          <Typography variant="body2" color="text.secondary">
            {message}
          </Typography>
        ) : null}
      </Stack>
      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{selectedCarpenter?.fullName || "Karigar detail"}</DialogTitle>
        <DialogContent>
          {detailLoading ? <CircularProgress size={24} sx={{ mt: 1 }} /> : null}
          {!detailLoading && selectedCarpenter ? (
            <Stack spacing={1.25} sx={{ pt: 0.5 }}>
              <Typography variant="body2" color="text.secondary">
                {selectedCarpenter.city}, {selectedCarpenter.state} • {canContact ? selectedCarpenter.phone || "Phone pending" : "Login + active plan ke baad contact dikhega"}
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Pill label={`${selectedCarpenter.averageRating} rating`} />
                <Pill label={`${selectedCarpenter.experienceYears} years exp`} />
                <Pill
                  label={selectedCarpenter.kycStatus === "approved" ? dictionary.home.kycVerified : dictionary.home.kycPending}
                  tone={selectedCarpenter.kycStatus === "approved" ? "success" : "warning"}
                />
                <Pill label={selectedCarpenter.availabilityStatus} tone={selectedCarpenter.availabilityStatus === "available" ? "success" : "soft"} />
              </Stack>
              <Typography variant="body2" color="text.secondary">
                Skills: {selectedCarpenter.skills.join(", ") || "General carpentry"}
              </Typography>
              <Typography variant="body2" color="primary.main" fontWeight={700}>
                Daily ₹{selectedCarpenter.rateCard?.daily || 0} • Half day ₹{selectedCarpenter.rateCard?.halfDay || 0} • Monthly ₹{selectedCarpenter.rateCard?.monthly || 0}
              </Typography>
              <Typography variant="subtitle2" fontWeight={700}>
                Recent hajri & payment
              </Typography>
              {selectedCarpenter.attendanceHistory.length > 0 ? selectedCarpenter.attendanceHistory.map((item) => (
                <Card key={item.id} variant="outlined">
                  <CardContent sx={{ p: 1.5 }}>
                    <Stack spacing={0.5}>
                      <Typography variant="body2" fontWeight={700}>
                        {new Date(item.date).toLocaleDateString("en-IN")} • {item.attendanceType.replace("_", " ")}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Thekedar: {item.contractorName} {canContact && item.contractorPhone ? `• ${item.contractorPhone}` : ""}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Hajri: {item.shiftHours} hr • OT {item.overtimeHours} hr • {item.approvalStatus}
                      </Typography>
                      <Typography variant="body2" color="primary.main" fontWeight={700}>
                        Approx {item.rateModel === "half_day" ? "half-day" : "per-day"} rate: ₹{item.dailyRate}
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              )) : (
                <Typography variant="body2" color="text.secondary">
                  Abhi hajri history available nahi hai.
                </Typography>
              )}
              <Typography variant="subtitle2" fontWeight={700}>
                Reviews
              </Typography>
              {selectedCarpenter.reviews.length > 0 ? selectedCarpenter.reviews.map((review) => (
                <Card key={review.id} variant="outlined">
                  <CardContent sx={{ p: 1.5 }}>
                    <Typography variant="body2" fontWeight={700}>
                      {review.title} • {review.rating}/5
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {review.comment}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {review.reviewerName} ({review.reviewerRole})
                    </Typography>
                  </CardContent>
                </Card>
              )) : (
                <Typography variant="body2" color="text.secondary">
                  Abhi reviews nahi mile.
                </Typography>
              )}
            </Stack>
          ) : null}
        </DialogContent>
        <DialogActions>
          {canContact ? (
            selectedCarpenter?.phone ? (
              <Button component="a" href={`tel:${selectedCarpenter.phone}`}>
                {dictionary.carpenters.contact}
              </Button>
            ) : (
              <Button onClick={() => setMessage("Is karigar ka contact number abhi available nahi hai.")}>
                {dictionary.carpenters.contact}
              </Button>
            )
          ) : (
            <Button onClick={() => {
              setMessage(getContactLockMessage(authUser));
              void ensureConnectAccess("Contact");
            }}>{dictionary.carpenters.contact}</Button>
          )}
          <Button variant="contained" onClick={() => setDetailOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={bookingOpen} onClose={() => !bookingLoading && setBookingOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Book karigar</DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} sx={{ pt: 0.5 }}>
            <Typography variant="body2" color="text.secondary">
              {bookingCarpenter?.fullName} ko request jayegi. Accept hone ke baad connection `My Karigar` aur `My Thekedar` me dikh jayega.
            </Typography>
            <TextField
              select
              label="Rate model"
              value={rateModel}
              onChange={(event) => setRateModel(event.target.value)}
            >
              <MenuItem value="half_day">Half day</MenuItem>
              <MenuItem value="full_day">Full day</MenuItem>
              <MenuItem value="monthly">Monthly</MenuItem>
            </TextField>
            <TextField
              label="Agreed rate"
              type="number"
              value={agreedRate}
              onChange={(event) => setAgreedRate(event.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBookingOpen(false)} disabled={bookingLoading}>Cancel</Button>
          <Button onClick={handleBookingRequest} variant="contained" disabled={bookingLoading}>
            {bookingLoading ? "Sending..." : "Send request"}
          </Button>
        </DialogActions>
      </Dialog>
    </MobileShell>
  );
}
