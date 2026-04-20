"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Alert, Box, Button, Card, CardContent, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Rating, Stack, TextField, Typography } from "@mui/material";
import { MobileShell } from "@/components/app-shell/mobile-shell";
import { getMyOffers, getMyThekedars, respondToOffer } from "@/lib/api/account";
import { getAuthUser } from "@/lib/auth-storage";
import { Pill } from "@/components/ui/pill";
import { getContractorPublicProfile } from "@/lib/api/trust";
import { submitReview } from "@/lib/api/reviews";
import { getConnectAccessState, getContactLockMessage, hasActivePlan } from "@/lib/plan-access";
import { getBookings, updateBookingStatus, type BookingListItem } from "@/lib/api/marketplace";
import { getChatThread, getOrCreateChatThread, sendChatMessage, type ChatThread } from "@/lib/api/chats";

export function MyThekedarScreen() {
  const router = useRouter();
  const authUser = getAuthUser();
  const canContact = hasActivePlan(authUser);
  const [items, setItems] = useState<Array<{ id: string; userId: string; name: string; city: string; phone: string; type: string }>>([]);
  const [offers, setOffers] = useState<Array<{ id: string; contractorId: string; carpenterId: string; contractorName: string; jobTitle: string; city: string; rateLabel: string; paymentTerms: string; durationDays: number; outstationAllowance: number; overtimeRate: number; message: string; status: string }>>([]);
  const [bookingRequests, setBookingRequests] = useState<BookingListItem[]>([]);
  const [message, setMessage] = useState("");
  const [detailOpen, setDetailOpen] = useState(false);
  const [contractorDetail, setContractorDetail] = useState<null | {
    userId: string;
    fullName: string;
    city: string;
    phone: string;
    type: string;
    totalJobs: number;
    completedJobs: number;
    activeJobs: number;
    totalPaidAmount: number;
    averageRating: number;
    reviews: Array<{ id: string; rating: number; title: string; comment: string; reviewerName: string; reviewerRole: string; createdAt: string }>;
    workHistory: Array<{ id: string; carpenterId: string; carpenterName: string; jobTitle: string; status: string; rateModel: string; agreedRate: number; createdAt: string }>;
    activeJobsPosted: Array<{ id: string; title: string; city: string; carpenterCountNeeded: number; status: string; createdAt: string }>;
  } | null>(null);
  const [reviewRating, setReviewRating] = useState<number | null>(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [chatOpen, setChatOpen] = useState(false);
  const [chatThread, setChatThread] = useState<ChatThread | null>(null);
  const [chatDraft, setChatDraft] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  function ensureConnectAccess(actionLabel: string) {
    const gate = getConnectAccessState(authUser, "/my-thekedar");
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
    if (authUser && authUser.role !== "carpenter") {
      router.replace("/my-karigar");
    }
  }, [authUser, router]);

  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        if (authUser?.role === "carpenter") {
          const [offersResponse, linkedThekedarResponse, pendingBookingResponse] = await Promise.all([
            getMyOffers(),
            getMyThekedars(),
            getBookings({ status: "pending" })
          ]);

          if (active) {
            setOffers(offersResponse.items);
            setItems(linkedThekedarResponse.items);
            setBookingRequests(pendingBookingResponse.items);
          }
        } else {
          const response = await getMyThekedars();
          if (active) setItems(response.items);
        }
      } catch (error) {
        if (active) setMessage(error instanceof Error ? error.message : "Thekedar list load nahi hui.");
      }
    }

    loadData();

    return () => {
      active = false;
    };
  }, [authUser?.role]);

  async function handleOfferAction(id: string, action: "accept" | "reject") {
    try {
      await respondToOffer(id, action);
      setOffers((current) => current.map((item) => (item.id === id ? { ...item, status: action === "accept" ? "accepted" : "rejected" } : item)));
      setMessage(action === "accept" ? "Offer accept ho gaya. Ab booking flow start hoga." : "Offer reject kar diya gaya.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Offer update nahi hui.");
    }
  }

  async function handleBookingRequestAction(id: string, action: "accepted" | "rejected") {
    if (action === "accepted" && !ensureConnectAccess("Request accept")) {
      return;
    }

    try {
      await updateBookingStatus(id, action);
      setBookingRequests((current) => current.filter((item) => item.id !== id));

      if (action === "accepted") {
        const linkedResponse = await getMyThekedars();
        setItems(linkedResponse.items);
        setMessage("Booking request accept ho gayi. Ab linked thekedar neeche dikh raha hoga.");
      } else {
        setMessage("Booking request reject kar di gayi.");
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Booking request update nahi hui.");
    }
  }

  async function openThekedarDetail(id: string) {
    try {
      const response = await getContractorPublicProfile(id);
      setContractorDetail(response.item);
      setReviewRating(5);
      setReviewTitle("");
      setReviewComment("");
      setDetailOpen(true);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Thekedar detail load nahi hui.");
    }
  }

  async function handleSubmitReview() {
    if (!contractorDetail || !reviewRating) {
      setMessage("Rating select karo.");
      return;
    }

    try {
      const response = await submitReview({
        revieweeUserId: contractorDetail.userId,
        rating: reviewRating,
        title: reviewTitle,
        comment: reviewComment
      });

      setContractorDetail((current) =>
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

  async function openChat(item: { userId: string }) {
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
    const threadId = chatThread?.id;
    if (!chatOpen || !threadId) {
      return;
    }

    let active = true;

    async function refreshChat() {
      try {
        const response = await getChatThread(threadId);
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
    <MobileShell title="My Thekedar" subtitle={authUser?.role === "carpenter" ? "Yahan thekedar ke offers compare karke choose karo" : "Aapke connected contractor / thekedaar"}>
      <Stack spacing={2}>
        {message ? <Alert severity="error">{message}</Alert> : null}
        {authUser?.role === "carpenter" && bookingRequests.length > 0 ? (
          <>
            <Typography variant="subtitle1" fontWeight={700}>Booking requests</Typography>
            {bookingRequests.map((item) => (
              <Card key={item.id}>
                <CardContent sx={{ p: 2 }}>
                  <Stack spacing={1}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1}>
                      <Typography variant="subtitle1" fontWeight={700}>{item.party}</Typography>
                      <Pill label="pending" tone="warning" />
                    </Stack>
                    <Typography variant="body2" color="text.secondary">{item.title}</Typography>
                    <Typography variant="body2" color="primary.main" fontWeight={700}>{item.amount}</Typography>
                    <Stack direction="row" spacing={1}>
                      <Button variant="contained" fullWidth onClick={() => handleBookingRequestAction(item.id, "accepted")}>
                        Accept
                      </Button>
                      <Button variant="outlined" fullWidth onClick={() => handleBookingRequestAction(item.id, "rejected")}>
                        Reject
                      </Button>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </>
        ) : null}
        {authUser?.role === "carpenter" && offers.length > 0 ? (
          <>
            <Typography variant="subtitle1" fontWeight={700}>Thekedar offers</Typography>
            {offers.map((item) => (
            <Card key={item.id}>
              <CardContent sx={{ p: 2 }}>
                <Stack spacing={1}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1}>
                    <Typography variant="subtitle1" fontWeight={700}>{item.contractorName}</Typography>
                    <Pill label={item.status} tone={item.status === "accepted" ? "success" : item.status === "rejected" ? "warning" : "soft"} />
                  </Stack>
                  <Typography variant="body2" color="text.secondary">{item.jobTitle} • {item.city}</Typography>
                  <Typography variant="body2" color="primary.main" fontWeight={700}>{item.rateLabel}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.paymentTerms} • {item.durationDays} days • OT ₹{item.overtimeRate}/hr • Outstation ₹{item.outstationAllowance}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">{item.message}</Typography>
                  {item.status === "pending" ? (
                    <Stack direction="row" spacing={1}>
                      <Button variant="contained" fullWidth onClick={() => handleOfferAction(item.id, "accept")}>
                        Accept
                      </Button>
                      <Button variant="outlined" fullWidth onClick={() => handleOfferAction(item.id, "reject")}>
                        Reject
                      </Button>
                    </Stack>
                  ) : null}
                  <Button variant="text" onClick={() => openThekedarDetail(item.contractorId)}>
                    View history & reviews
                  </Button>
                </Stack>
              </CardContent>
            </Card>
            ))}
          </>
        ) : null}
        {authUser?.role === "carpenter" && items.length > 0 ? (
          <>
            <Typography variant="subtitle1" fontWeight={700}>Linked thekedars</Typography>
            {items.map((item) => (
              <Card key={item.id}>
                <CardContent sx={{ p: 2 }}>
                  <Stack spacing={1}>
                    <Typography variant="subtitle1" fontWeight={700}>{item.name}</Typography>
                    <Typography variant="body2" color="text.secondary">{item.city} • {item.type}</Typography>
                    <Typography variant="body2" color="text.secondary">{canContact ? item.phone : "Login + active plan ke baad contact dikhega"}</Typography>
                    <Button variant="outlined" fullWidth onClick={() => {
                      setMessage(canContact ? `Call ${item.name} next module me connect karenge.` : getContactLockMessage(authUser));
                      if (!canContact) {
                        void ensureConnectAccess("Contact");
                      }
                    }}>
                      Contact
                    </Button>
                    <Button variant="contained" fullWidth onClick={() => openChat(item)}>
                      Chat
                    </Button>
                    <Button variant="text" fullWidth onClick={() => openThekedarDetail(item.id)}>
                      View history & reviews
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </>
        ) : null}
        {items.map((item) => (
          authUser?.role !== "carpenter" ? (
          <Card key={item.id}>
            <CardContent sx={{ p: 2 }}>
              <Stack spacing={1}>
                <Typography variant="subtitle1" fontWeight={700}>{item.name}</Typography>
                <Typography variant="body2" color="text.secondary">{item.city} • {item.type}</Typography>
                <Typography variant="body2" color="text.secondary">{canContact ? item.phone : "Login + active plan ke baad contact dikhega"}</Typography>
                <Button variant="outlined" fullWidth onClick={() => {
                  setMessage(canContact ? `Call ${item.name} next module me connect karenge.` : getContactLockMessage(authUser));
                  if (!canContact) {
                    void ensureConnectAccess("Contact");
                  }
                }}>
                  Contact
                </Button>
                <Button variant="contained" fullWidth onClick={() => openChat(item)}>
                  Chat
                </Button>
                <Button variant="text" fullWidth onClick={() => openThekedarDetail(item.id)}>
                  View history & reviews
                </Button>
              </Stack>
            </CardContent>
          </Card>
          ) : null
        ))}
        {!message && authUser?.role === "carpenter" && offers.length === 0 && bookingRequests.length === 0 && items.length === 0 ? (
          <Typography variant="body2" color="text.secondary">Abhi aapke liye koi booking request, offer ya linked thekedar nahi hai.</Typography>
        ) : null}
        {!message && authUser?.role !== "carpenter" && items.length === 0 ? (
          <Typography variant="body2" color="text.secondary">Abhi aapke account me koi thekedar linked nahi hai.</Typography>
        ) : null}
      </Stack>
      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{contractorDetail?.fullName || "Thekedar detail"}</DialogTitle>
        <DialogContent>
          {contractorDetail ? (
            <Stack spacing={1.25} sx={{ pt: 0.5 }}>
              <Typography variant="body2" color="text.secondary">
                {contractorDetail.city} • {contractorDetail.type} • {canContact ? contractorDetail.phone : "Login + active plan ke baad contact dikhega"}
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Pill label={`${contractorDetail.averageRating} rating`} />
                <Pill label={`${contractorDetail.completedJobs}/${contractorDetail.totalJobs} completed`} tone="success" />
                <Pill label={`₹${contractorDetail.totalPaidAmount} paid`} />
              </Stack>
              <Typography variant="subtitle2" fontWeight={700}>Recent work history</Typography>
              {contractorDetail.workHistory.map((item) => (
                <Typography key={item.id} variant="body2" color="text.secondary">
                  {item.jobTitle} • {item.carpenterName} • {item.status} • {item.rateModel} • ₹{item.agreedRate}
                </Typography>
              ))}
              <Typography variant="subtitle2" fontWeight={700} sx={{ mt: 1 }}>
                Active hiring posts
              </Typography>
              {contractorDetail.activeJobsPosted.length > 0 ? contractorDetail.activeJobsPosted.map((item) => (
                <Typography key={item.id} variant="body2" color="text.secondary">
                  {item.title} • {item.city} • {item.carpenterCountNeeded} karigar needed • {item.status}
                </Typography>
              )) : (
                <Typography variant="body2" color="text.secondary">Abhi koi active hiring post nahi hai.</Typography>
              )}
              <Typography variant="subtitle2" fontWeight={700} sx={{ mt: 1 }}>Reviews</Typography>
              {contractorDetail.reviews.length > 0 ? contractorDetail.reviews.map((item) => (
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
              {authUser?.role === "carpenter" ? (
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
