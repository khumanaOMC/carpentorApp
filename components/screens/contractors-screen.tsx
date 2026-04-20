"use client";

import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
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
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { MobileShell } from "@/components/app-shell/mobile-shell";
import { Pill } from "@/components/ui/pill";
import { useRouter } from "next/navigation";
import { getAuthUser } from "@/lib/auth-storage";
import { getContractors, type ContractorDirectoryItem } from "@/lib/api/profile";
import { getContractorPublicProfile } from "@/lib/api/trust";
import { getConnectAccessState, getContactLockMessage, hasActivePlan } from "@/lib/plan-access";
import { sendContractorRequest } from "@/lib/api/marketplace";

export function ContractorsScreen() {
  const router = useRouter();
  const authUser = getAuthUser();
  const [search, setSearch] = useState("");
  const [contractors, setContractors] = useState<ContractorDirectoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedContractor, setSelectedContractor] = useState<null | Awaited<ReturnType<typeof getContractorPublicProfile>>["item"]>(null);
  const [requestOpen, setRequestOpen] = useState(false);
  const [requestTarget, setRequestTarget] = useState<ContractorDirectoryItem | null>(null);
  const [proposedRate, setProposedRate] = useState("");
  const [coverNote, setCoverNote] = useState("");
  const canContact = hasActivePlan(authUser);

  function ensureConnectAccess(actionLabel: string) {
    const gate = getConnectAccessState(authUser, "/contractors");
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

    async function loadContractors() {
      setLoading(true);
      try {
        const response = await getContractors({ search: search || undefined });
        if (active) {
          setContractors(Array.isArray(response.items) ? response.items : []);
          setMessage("");
        }
      } catch (error) {
        if (active) {
          setContractors([]);
          setMessage(error instanceof Error ? error.message : "Thekedar list load nahi hui.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadContractors();
    return () => {
      active = false;
    };
  }, [search]);

  const emptyMessage = useMemo(() => {
    if (loading) return "";
    if (contractors.length === 0) return "Abhi koi matching thekedar nahi mila.";
    return "";
  }, [contractors.length, loading]);

  async function openContractorDetail(id: string) {
    setDetailLoading(true);
    setDetailOpen(true);
    try {
      const response = await getContractorPublicProfile(id);
      setSelectedContractor(response.item);
      setMessage("");
    } catch (error) {
      setSelectedContractor(null);
      setMessage(error instanceof Error ? error.message : "Thekedar detail load nahi hui.");
    } finally {
      setDetailLoading(false);
    }
  }

  function openRequestDialog(item: ContractorDirectoryItem) {
    if (!ensureConnectAccess("Request")) {
      return;
    }

    const currentUser = authUser;
    if (!currentUser) {
      return;
    }

    if (currentUser.role !== "carpenter") {
      setMessage("Ye request flow sirf karigar ke liye hai.");
      return;
    }

    setRequestTarget(item);
    setProposedRate("");
    setCoverNote("");
    setRequestOpen(true);
  }

  async function handleSendRequest() {
    if (!requestTarget) {
      return;
    }

    try {
      await sendContractorRequest({
        contractorId: requestTarget.id,
        proposedRate: proposedRate ? Number(proposedRate) : undefined,
        coverNote
      });
      setRequestOpen(false);
      setMessage("Thekedar ko request bhej di gayi.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Request send nahi hui.");
    }
  }

  return (
    <MobileShell title="Thekedars" subtitle="Dekho kis thekedar ne job post ki hai aur kis ko karigar chahiye">
      <Stack spacing={2}>
        <TextField
          fullWidth
          placeholder="Search thekedar by name or city"
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

        {loading ? <CircularProgress size={26} /> : null}

        <Stack spacing={1.5}>
          {contractors.map((item) => (
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
                          {item.city}, {item.state} • {item.type}
                        </Typography>
                      </div>
                    </Stack>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <StarRoundedIcon sx={{ fontSize: 18, color: "warning.main" }} />
                      <Typography fontWeight={700}>{item.averageRating.toFixed(1)}</Typography>
                    </Stack>
                  </Stack>

                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    <Pill label={`${item.activeJobs} active jobs`} tone="soft" />
                    <Pill label={`${item.completedJobs}/${item.totalJobs} completed`} tone="success" />
                  </Stack>

                  <Typography variant="body2" color="text.secondary">
                    {item.bio || "Verified thekedar with ongoing work requirements."}
                  </Typography>

                  <Stack direction="row" spacing={1}>
                    <Button variant="contained" fullWidth onClick={() => openContractorDetail(item.id)}>
                      View details
                    </Button>
                    {authUser?.role === "carpenter" ? (
                      <Button variant="outlined" fullWidth onClick={() => openRequestDialog(item)}>
                        Send request
                      </Button>
                    ) : canContact && item.phone ? (
                      <Button component="a" href={`tel:${item.phone}`} variant="outlined" fullWidth>
                        Contact
                      </Button>
                    ) : (
                      <Button variant="outlined" fullWidth onClick={() => {
                        setMessage(getContactLockMessage(authUser));
                        void ensureConnectAccess("Contact");
                      }}>
                        Contact
                      </Button>
                    )}
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>

        {emptyMessage ? (
          <Typography variant="body2" color="text.secondary">
            {emptyMessage}
          </Typography>
        ) : null}
        {message ? (
          <Typography variant="body2" color="text.secondary">
            {message}
          </Typography>
        ) : null}
      </Stack>

      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{selectedContractor?.fullName || "Thekedar detail"}</DialogTitle>
        <DialogContent>
          {detailLoading ? <CircularProgress size={24} sx={{ mt: 1 }} /> : null}
          {!detailLoading && selectedContractor ? (
            <Stack spacing={1.25} sx={{ pt: 0.5 }}>
              <Typography variant="body2" color="text.secondary">
                {selectedContractor.city} • {selectedContractor.type} • {canContact ? selectedContractor.phone || "Phone pending" : "Login + active plan ke baad contact dikhega"}
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Pill label={`${selectedContractor.averageRating} rating`} />
                <Pill label={`${selectedContractor.completedJobs}/${selectedContractor.totalJobs} completed`} tone="success" />
                <Pill label={`${selectedContractor.activeJobs} active`} tone="soft" />
              </Stack>

              <Typography variant="subtitle2" fontWeight={700}>
                Recent work history
              </Typography>
              {selectedContractor.workHistory.length > 0 ? selectedContractor.workHistory.map((item) => (
                <Card key={item.id} variant="outlined">
                  <CardContent sx={{ p: 1.5 }}>
                    <Typography variant="body2" fontWeight={700}>
                      {item.jobTitle}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Karigar: {item.carpenterName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.status} • {item.rateModel} • ₹{item.agreedRate}
                    </Typography>
                  </CardContent>
                </Card>
              )) : (
                <Typography variant="body2" color="text.secondary">
                  Abhi work history available nahi hai.
                </Typography>
              )}

              <Typography variant="subtitle2" fontWeight={700}>
                Active hiring posts
              </Typography>
              {selectedContractor.activeJobsPosted.length > 0 ? selectedContractor.activeJobsPosted.map((item) => (
                <Card key={item.id} variant="outlined">
                  <CardContent sx={{ p: 1.5 }}>
                    <Typography variant="body2" fontWeight={700}>
                      {item.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.city} • {item.carpenterCountNeeded} karigar chahiye
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Status: {item.status}
                    </Typography>
                  </CardContent>
                </Card>
              )) : (
                <Typography variant="body2" color="text.secondary">
                  Abhi koi active job post nahi hai.
                </Typography>
              )}
            </Stack>
          ) : null}
        </DialogContent>
        <DialogActions>
          {canContact && selectedContractor?.phone ? (
            <Button component="a" href={`tel:${selectedContractor.phone}`}>
              Contact
            </Button>
          ) : (
            <Button onClick={() => {
              setMessage(getContactLockMessage(authUser));
              void ensureConnectAccess("Contact");
            }}>
              Contact
            </Button>
          )}
          <Button variant="contained" onClick={() => setDetailOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={requestOpen} onClose={() => setRequestOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{requestTarget?.fullName || "Send request"}</DialogTitle>
        <DialogContent>
          <Stack spacing={1.25} sx={{ pt: 0.5 }}>
            <Typography variant="body2" color="text.secondary">
              Thekedar ko aapki direct request jayegi. Accept hone par aap linked ho jaoge.
            </Typography>
            <TextField
              label="Expected rate"
              type="number"
              value={proposedRate}
              onChange={(event) => setProposedRate(event.target.value)}
            />
            <TextField
              label="Cover note"
              multiline
              minRows={3}
              value={coverNote}
              onChange={(event) => setCoverNote(event.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRequestOpen(false)}>Cancel</Button>
          <Button onClick={handleSendRequest} variant="contained">Send request</Button>
        </DialogActions>
      </Dialog>
    </MobileShell>
  );
}
