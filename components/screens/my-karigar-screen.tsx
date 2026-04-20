"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Alert, Box, Button, Card, CardContent, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Rating, Stack, TextField, Typography } from "@mui/material";
import { MobileShell } from "@/components/app-shell/mobile-shell";
import { getIncomingCarpenterRequests, getMyAttendanceSummary, getMyKarigars, respondToCarpenterRequest } from "@/lib/api/account";
import { getAuthUser } from "@/lib/auth-storage";
import { Pill } from "@/components/ui/pill";
import { getCarpenterPublicProfile } from "@/lib/api/trust";
import { submitReview } from "@/lib/api/reviews";
import { getConnectAccessState, hasActivePlan } from "@/lib/plan-access";
import { getChatThread, getOrCreateChatThread, sendChatMessage, type ChatThread } from "@/lib/api/chats";

export function MyKarigarScreen() {
  const router = useRouter();
  const authUser = getAuthUser();
  const canContact = hasActivePlan(authUser);
  const [items, setItems] = useState<Array<{ id: string; userId: string; name: string; city: string; phone: string; availabilityStatus: string; skills: string[] }>>([]);
  const [incomingRequests, setIncomingRequests] = useState<Array<{ id: string; carpenterId: string; carpenterUserId: string; carpenterName: string; phone: string; city: string; skills: string[]; proposedRate: number; coverNote: string; status: string }>>([]);
  const [attendance, setAttendance] = useState<{
    summary: {
      totalDays: number;
      approvedDays: number;
      overtimeHours: number;
      pendingApprovals: number;
      estimatedEarnings: number;
    };
    items: Array<{ id: string; date: string; attendanceType: string; approvalStatus: string; overtimeHours: number; shiftHours: number }>;
  } | null>(null);
  const [message, setMessage] = useState("");
  const [detailOpen, setDetailOpen] = useState(false);
  const [carpenterDetail, setCarpenterDetail] = useState<null | {
    userId: string;
    fullName: string;
    phone: string;
    city: string;
    state: string;
    skills: string[];
    averageRating: number;
    totalJobs: number;
    completedJobs: number;
    reviews: Array<{ id: string; rating: number; title: string; comment: string; reviewerName: string; reviewerRole: string; createdAt: string }>;
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
  } | null>(null);
  const [reviewRating, setReviewRating] = useState<number | null>(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [chatOpen, setChatOpen] = useState(false);
  const [chatThread, setChatThread] = useState<ChatThread | null>(null);
  const [chatDraft, setChatDraft] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  function ensureConnectAccess(actionLabel: string) {
    const gate = getConnectAccessState(authUser, "/my-karigar");
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
    if (authUser?.role === "carpenter") {
      router.replace("/my-thekedar");
    }
  }, [authUser?.role, router]);

  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        if (authUser?.role === "carpenter") {
          const response = await getMyAttendanceSummary();
          if (active) setAttendance(response);
        } else {
          const [response, incomingResponse] = await Promise.all([
            getMyKarigars(),
            authUser?.role === "contractor" ? getIncomingCarpenterRequests() : Promise.resolve({ items: [] })
          ]);
          if (active) {
            setItems(response.items);
            setIncomingRequests(incomingResponse.items);
          }
        }
      } catch (error) {
        if (active) setMessage(error instanceof Error ? error.message : "Karigar list load nahi hui.");
      }
    }

    loadData();

    return () => {
      active = false;
    };
  }, [authUser?.role]);

  async function openKarigarDetail(id: string) {
    try {
      const response = await getCarpenterPublicProfile(id);
      setCarpenterDetail(response.item);
      setReviewRating(5);
      setReviewTitle("");
      setReviewComment("");
      setDetailOpen(true);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Karigar detail load nahi hui.");
    }
  }

  async function handleSubmitReview() {
    if (!carpenterDetail || !reviewRating) {
      setMessage("Rating select karo.");
      return;
    }

    try {
      const response = await submitReview({
        revieweeUserId: carpenterDetail.userId,
        rating: reviewRating,
        title: reviewTitle,
        comment: reviewComment
      });

      setCarpenterDetail((current) =>
        current
          ? {
            ...current,
            reviews: [
              {
                id: response.item.id,
                rating: reviewRating,
                title: reviewTitle,
                comment: reviewComment,
                reviewerName: authUser?.fullName || "You",
                reviewerRole: authUser?.role || "user",
                createdAt: new Date().toISOString()
              },
              ...current.reviews
            ]
          }
          : current
      );
      setReviewTitle("");
      setReviewComment("");
      setReviewRating(5);
      setMessage("Review submit ho gaya.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Review submit nahi hua.");
    }
  }

  async function handleIncomingRequest(id: string, status: "accepted" | "rejected") {
    if (status === "accepted" && !ensureConnectAccess("Request accept")) {
      return;
    }

    try {
      await respondToCarpenterRequest(id, status);
      setIncomingRequests((current) => current.filter((item) => item.id !== id));

      if (status === "accepted") {
        const linked = await getMyKarigars();
        setItems(linked.items);
        setMessage("Karigar request accept ho gayi. Ab ye My Karigar me linked dikh raha hoga.");
      } else {
        setMessage("Karigar request reject kar di.");
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Request update nahi hui.");
    }
  }

  async function openChat(item: { userId: string; name: string; id: string }) {
    if (!ensureConnectAccess("Chat")) {
      return;
    }

    try {
      setChatLoading(true);
      const response = await getOrCreateChatThread({ participantUserId: item.userId });
      setChatThread(response.item);
      setChatDraft("");
      setChatOpen(true);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Chat open nahi hui.");
    } finally {
      setChatLoading(false);
    }
  }

  async function handleSendChat() {
    if (!chatThread || !chatDraft.trim()) {
      return;
    }

    try {
      setChatLoading(true);
      const response = await sendChatMessage(chatThread.id, chatDraft);
      setChatThread(response.item);
      setChatDraft("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Message send nahi hua.");
    } finally {
      setChatLoading(false);
    }
  }

  useEffect(() => {
    if (!chatOpen || !chatThread?.id) {
      return;
    }

    let active = true;

    async function refreshChat() {
      try {
        const response = await getChatThread(chatThread.id);
        if (active) {
          setChatThread(response.item);
        }
      } catch {}
    }

    refreshChat();
    const intervalId = window.setInterval(refreshChat, 3000);

    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [chatOpen, chatThread?.id]);

  return (
    <MobileShell title="My Karigar" subtitle={authUser?.role === "carpenter" ? "Aapki saved hajri aur earning summary" : "Booked aur connected carpenters / workers"}>
      <Stack spacing={2}>
        {message ? <Alert severity="error">{message}</Alert> : null}
        {authUser?.role === "carpenter" && attendance ? (
          <>
            <Card>
              <CardContent sx={{ p: 2 }}>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Pill label={`Total hajri ${attendance.summary.totalDays}`} />
                  <Pill label={`Approved ${attendance.summary.approvedDays}`} tone="success" />
                  <Pill label={`Pending ${attendance.summary.pendingApprovals}`} tone="warning" />
                  <Pill label={`OT ${attendance.summary.overtimeHours} hr`} />
                  <Pill label={`₹${attendance.summary.estimatedEarnings} earned`} />
                </Stack>
              </CardContent>
            </Card>
            {attendance.items.map((item) => (
              <Card key={item.id}>
                <CardContent sx={{ p: 2 }}>
                  <Stack spacing={1}>
                    <Typography variant="subtitle1" fontWeight={700}>
                      {new Date(item.date).toLocaleDateString("en-IN")}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.attendanceType} • {item.shiftHours} hr shift • OT {item.overtimeHours} hr
                    </Typography>
                    <Pill label={item.approvalStatus} tone={item.approvalStatus === "approved" ? "success" : "warning"} />
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </>
        ) : null}
        {authUser?.role === "contractor" && incomingRequests.length > 0 ? (
          <>
            <Typography variant="subtitle1" fontWeight={700}>Pending karigar requests</Typography>
            {incomingRequests.map((item) => (
              <Card key={item.id}>
                <CardContent sx={{ p: 2 }}>
                  <Stack spacing={1}>
                    <Typography variant="subtitle1" fontWeight={700}>{item.carpenterName}</Typography>
                    <Typography variant="body2" color="text.secondary">{item.city} • {item.skills.join(", ") || "General carpentry"}</Typography>
                    <Typography variant="body2" color="text.secondary">{item.phone}</Typography>
                    {item.proposedRate ? (
                      <Typography variant="body2" color="primary.main" fontWeight={700}>Expected rate: ₹{item.proposedRate}</Typography>
                    ) : null}
                    {item.coverNote ? (
                      <Typography variant="body2" color="text.secondary">{item.coverNote}</Typography>
                    ) : null}
                    <Stack direction="row" spacing={1}>
                      <Button variant="contained" fullWidth onClick={() => handleIncomingRequest(item.id, "accepted")}>
                        Accept
                      </Button>
                      <Button variant="outlined" fullWidth onClick={() => handleIncomingRequest(item.id, "rejected")}>
                        Reject
                      </Button>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </>
        ) : null}
        {items.map((item) => (
          <Card key={item.id}>
            <CardContent sx={{ p: 2 }}>
              <Stack spacing={1}>
                <Typography variant="subtitle1" fontWeight={700}>{item.name}</Typography>
                <Typography variant="body2" color="text.secondary">{item.city} • {item.availabilityStatus}</Typography>
                <Typography variant="body2" color="text.secondary">{item.skills.join(", ") || "General carpentry"}</Typography>
                <Typography variant="body2" color="text.secondary">{canContact ? item.phone : "Login + active plan ke baad contact dikhega"}</Typography>
                <Button variant="outlined" fullWidth onClick={() => openChat(item)}>
                  Chat
                </Button>
                <Button variant="contained" fullWidth onClick={() => openKarigarDetail(item.id)}>
                  View history & reviews
                </Button>
              </Stack>
            </CardContent>
          </Card>
        ))}
        {!message && authUser?.role === "carpenter" && attendance && attendance.items.length === 0 ? (
          <Typography variant="body2" color="text.secondary">Abhi aapki koi saved hajri nahi hai.</Typography>
        ) : null}
        {!message && authUser?.role !== "carpenter" && items.length === 0 ? (
          <Typography variant="body2" color="text.secondary">Abhi aapke account me koi karigar linked nahi hai.</Typography>
        ) : null}
      </Stack>
      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{carpenterDetail?.fullName || "Karigar detail"}</DialogTitle>
        <DialogContent>
          {carpenterDetail ? (
            <Stack spacing={1.25} sx={{ pt: 0.5 }}>
              <Typography variant="body2" color="text.secondary">
                {carpenterDetail.city}, {carpenterDetail.state} • {canContact ? carpenterDetail.phone || "Phone pending" : "Login + active plan ke baad contact dikhega"}
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Pill label={`${carpenterDetail.averageRating} rating`} />
                <Pill label={`${carpenterDetail.completedJobs}/${carpenterDetail.totalJobs} completed`} tone="success" />
                {carpenterDetail.skills.slice(0, 3).map((skill) => <Pill key={skill} label={skill} tone="outlined" />)}
              </Stack>
              <Typography variant="subtitle2" fontWeight={700}>Recent hajri & payment</Typography>
              {carpenterDetail.attendanceHistory.map((item) => (
                <Typography key={item.id} variant="body2" color="text.secondary">
                  {new Date(item.date).toLocaleDateString("en-IN")} • {item.contractorName} • {item.attendanceType.replace("_", " ")} • ₹{item.dailyRate}/day
                </Typography>
              ))}
              <Typography variant="subtitle2" fontWeight={700} sx={{ mt: 1 }}>Reviews</Typography>
              {carpenterDetail.reviews.length > 0 ? carpenterDetail.reviews.map((item) => (
                <Card key={item.id} variant="outlined">
                  <CardContent sx={{ p: 1.5 }}>
                    <Typography variant="body2" fontWeight={700}>
                      {item.title} • {item.rating}/5
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.comment}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {item.reviewerName} ({item.reviewerRole})
                    </Typography>
                  </CardContent>
                </Card>
              )) : (
                <Typography variant="body2" color="text.secondary">Abhi reviews nahi mile.</Typography>
              )}
              {authUser?.role === "contractor" ? (
                <Card variant="outlined" sx={{ mt: 1 }}>
                  <CardContent sx={{ p: 1.5 }}>
                    <Stack spacing={1.2}>
                      <Typography variant="subtitle2" fontWeight={700}>Review do</Typography>
                      <Rating value={reviewRating} onChange={(_, value) => setReviewRating(value)} />
                      <TextField
                        size="small"
                        label="Title"
                        value={reviewTitle}
                        onChange={(event) => setReviewTitle(event.target.value)}
                      />
                      <TextField
                        size="small"
                        label="Comment"
                        multiline
                        minRows={3}
                        value={reviewComment}
                        onChange={(event) => setReviewComment(event.target.value)}
                      />
                      <Button variant="contained" onClick={handleSubmitReview}>
                        Submit review
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              ) : null}
            </Stack>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={chatOpen} onClose={() => setChatOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{chatThread?.participant?.fullName || "Chat"}</DialogTitle>
        <DialogContent>
          <Stack spacing={1.25} sx={{ pt: 0.5 }}>
            {chatLoading && !chatThread ? <CircularProgress size={22} /> : null}
            {(chatThread?.messages || []).length > 0 ? chatThread?.messages.map((item) => {
              const ownMessage = item.senderUserId === authUser?.id;

              return (
                <Box
                  key={item.id}
                  sx={{
                    display: "flex",
                    justifyContent: ownMessage ? "flex-end" : "flex-start",
                    width: "100%"
                  }}
                >
                  <Card
                    variant="outlined"
                    sx={{
                      width: "fit-content",
                      maxWidth: "85%",
                      bgcolor: ownMessage ? "primary.main" : "background.paper",
                      color: ownMessage ? "primary.contrastText" : "text.primary",
                      borderColor: ownMessage ? "primary.main" : "divider"
                    }}
                  >
                    <CardContent sx={{ p: 1.25 }}>
                      <Typography variant="body2">{item.text}</Typography>
                      <Typography
                        variant="caption"
                        sx={{ display: "block", mt: 0.75, opacity: 0.75, textAlign: ownMessage ? "right" : "left" }}
                      >
                        {new Date(item.sentAt).toLocaleString("en-IN")}
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
              );
            }) : (
              <Typography variant="body2" color="text.secondary">Abhi koi message nahi hai. Chat start karo.</Typography>
            )}
            <TextField
              label="Message"
              value={chatDraft}
              onChange={(event) => setChatDraft(event.target.value)}
              multiline
              minRows={2}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void handleSendChat();
                }
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setChatOpen(false)}>Close</Button>
          <Button onClick={handleSendChat} variant="contained" disabled={chatLoading || !chatDraft.trim()}>
            {chatLoading ? "Sending..." : "Send"}
          </Button>
        </DialogActions>
      </Dialog>
    </MobileShell>
  );
}
