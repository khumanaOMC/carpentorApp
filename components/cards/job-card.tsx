"use client";

import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography
} from "@mui/material";
import { Pill } from "@/components/ui/pill";
import { getAuthUser } from "@/lib/auth-storage";
import { getConnectAccessState, getContactLockMessage, hasActivePlan } from "@/lib/plan-access";

type JobCardProps = {
  id: string;
  title: string;
  location: string;
  city: string;
  rate: string;
  tags: string[];
  status: string;
  description: string;
  workType: string;
  postedBy: {
    contractorId: string;
    name: string;
    phone: string;
    city: string;
    type: string;
  };
  onApply?: (id: string) => Promise<void> | void;
  requiresLogin?: boolean;
  loginHref?: string;
};

export function JobCard({
  id,
  title,
  location,
  city,
  rate,
  tags,
  status,
  description,
  workType,
  postedBy,
  onApply,
  requiresLogin = false,
  loginHref = "/login"
}: JobCardProps) {
  const router = useRouter();
  const authUser = getAuthUser();
  const canContact = hasActivePlan(authUser);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [applyOpen, setApplyOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function handleContactAccess() {
    const gate = getConnectAccessState(authUser, "/jobs");
    if (gate.redirectTo) {
      router.push(gate.redirectTo);
    }
  }

  async function handleApply() {
    if (requiresLogin) {
      setApplyOpen(false);
      return;
    }

    if (!onApply) {
      setApplyOpen(false);
      return;
    }

    setSubmitting(true);
    try {
      await onApply(id);
      setApplyOpen(false);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Card>
        <CardContent sx={{ p: 2 }}>
          <Stack spacing={1.5}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={1}>
              <div>
                <Typography variant="subtitle1" fontWeight={700}>
                  {title}
                </Typography>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <LocationOnRoundedIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                  <Typography variant="body2" color="text.secondary">
                    {location}
                  </Typography>
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  Posted by {postedBy.name} • {postedBy.city}
                </Typography>
              </div>
              <Pill label={status} />
            </Stack>
            <Typography variant="h6" color="primary.main">
              {rate}
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {tags.map((tag) => (
                <Pill key={tag} label={tag} tone="outlined" />
              ))}
            </Stack>
            <Stack direction="row" spacing={1}>
              <Button variant="contained" fullWidth onClick={() => setApplyOpen(true)}>
                Apply
              </Button>
              <Button variant="outlined" fullWidth onClick={() => setDetailsOpen(true)}>
                Details
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} fullWidth>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <Stack spacing={1.25} sx={{ pt: 0.5 }}>
            <Typography variant="body2" color="text.secondary">
              {location}
            </Typography>
            <Pill label={workType} />
            <Typography variant="body2" color="text.secondary">
              Thekedar: {postedBy.name} • {postedBy.type} • {postedBy.city || city}
            </Typography>
            {canContact && postedBy.phone ? (
              <Typography variant="body2" color="text.secondary">
                Contact: {postedBy.phone}
              </Typography>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Contact dekhne ke liye login + active plan zaroori hai.
              </Typography>
            )}
            <Typography variant="body1">{description}</Typography>
            <Typography variant="subtitle1" color="primary.main">
              {rate}
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>Close</Button>
          <Button variant="contained" onClick={() => {
            setDetailsOpen(false);
            setApplyOpen(true);
          }}>
            Apply now
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={applyOpen} onClose={() => setApplyOpen(false)} fullWidth>
        <DialogTitle>Apply for {title}</DialogTitle>
        <DialogContent>
          {requiresLogin ? (
            <Typography variant="body2" color="text.secondary" sx={{ pt: 0.5 }}>
              Job apply karne ke liye pehle login ya register karna zaroori hai.
            </Typography>
          ) : (
            <Stack spacing={1} sx={{ pt: 0.5 }}>
              <Typography variant="body2" color="text.secondary">
                Aap `{title}` ke liye apply karne wale ho. Yeh post `{postedBy.name}` ne `{postedBy.city || city}` se dali hai.
              </Typography>
              {canContact && postedBy.phone ? (
                <Typography variant="body2" color="text.secondary">
                  Contact number: {postedBy.phone}
                </Typography>
              ) : (
                <Button variant="text" sx={{ alignSelf: "flex-start", px: 0 }} onClick={handleContactAccess}>
                  {getContactLockMessage(authUser)}
                </Button>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApplyOpen(false)}>Cancel</Button>
          {requiresLogin ? (
            <Button component={Link} href={loginHref} variant="contained">
              Login to apply
            </Button>
          ) : (
            <Button variant="contained" onClick={handleApply} disabled={submitting}>
              {submitting ? "Applying..." : "Confirm application"}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
}
