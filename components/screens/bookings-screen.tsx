"use client";

import CallRoundedIcon from "@mui/icons-material/CallRounded";
import ChatRoundedIcon from "@mui/icons-material/ChatRounded";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  LinearProgress,
  Stack,
  Tab,
  TextField,
  Tabs,
  Typography
} from "@mui/material";
import { MobileShell } from "@/components/app-shell/mobile-shell";
import { AttendanceCard } from "@/components/cards/attendance-card";
import { getAuthUser } from "@/lib/auth-storage";
import { getChatThread, getOrCreateChatThread, sendChatMessage, type ChatThread } from "@/lib/api/chats";
import {
  approveAttendance,
  getAttendanceLogs,
  getBookings,
  updateBookingStatus,
  type AttendanceListItem,
  type BookingListItem
} from "@/lib/api/marketplace";
import { getConnectAccessState } from "@/lib/plan-access";

export function BookingsScreen() {
  const router = useRouter();
  const authUser = getAuthUser();
  const [tab, setTab] = useState(0);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [logs, setLogs] = useState<AttendanceListItem[]>([]);
  const [bookings, setBookings] = useState<BookingListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatThread, setChatThread] = useState<ChatThread | null>(null);
  const [chatDraft, setChatDraft] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  const statusKey = ["active", "pending", "completed"][tab];
  const visibleBookings = bookings.filter((booking) => booking.status === statusKey);

  function ensureConnectAccess(actionLabel: string) {
    const gate = getConnectAccessState(authUser, "/bookings");
    if (gate.allowed) {
      return true;
    }

    setSnackbarMessage(`${actionLabel}: ${gate.message}`);
    if (gate.redirectTo) {
      router.push(gate.redirectTo);
    }
    return false;
  }

  useEffect(() => {
    let active = true;

    async function loadBookingData() {
      setLoading(true);
      try {
        const bookingResponse = await getBookings();
        if (!active) return;
        setBookings(bookingResponse.items);

        if (bookingResponse.items[0]) {
          const attendanceResponse = await getAttendanceLogs(bookingResponse.items[0].id);
          if (active) {
            setLogs(attendanceResponse.items);
          }
        } else if (active) {
          setLogs([]);
        }
      } catch (error) {
        if (active) {
          setSnackbarMessage(error instanceof Error ? error.message : "Booking data load nahi hua.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadBookingData();
    return () => {
      active = false;
    };
  }, []);

  async function markAttendanceApproved(id: string) {
    try {
      await approveAttendance(id);
      setLogs((current) =>
        current.map((log) =>
          log.id === id ? { ...log, approved: true, approvalStatus: "approved", note: "Approved by contractor" } : log
        )
      );
      setSnackbarMessage("Attendance approved");
    } catch (error) {
      setSnackbarMessage(error instanceof Error ? error.message : "Attendance approve nahi hui.");
    }
  }

  async function handleBookingAdvance(id: string) {
    try {
      await updateBookingStatus(id, "completed");
      setBookings((current) =>
        current.map((booking) =>
          booking.id === id ? { ...booking, status: "completed", amount: "Paid and completed", progress: 100 } : booking
        )
      );
      setSnackbarMessage("Booking settlement complete kar diya.");
    } catch (error) {
      setSnackbarMessage(error instanceof Error ? error.message : "Booking update fail ho gaya.");
    }
  }

  async function handleBookingDecision(id: string, status: "accepted" | "rejected") {
    if (status === "accepted" && !ensureConnectAccess("Request accept")) {
      return;
    }

    try {
      await updateBookingStatus(id, status);
      setBookings((current) =>
        current.map((booking) =>
          booking.id === id
            ? {
              ...booking,
              status: status === "accepted" ? "active" : "rejected",
              progress: status === "accepted" ? 52 : 24
            }
            : booking
        )
      );
      setSnackbarMessage(
        status === "accepted"
          ? "Booking request accept ho gayi. Ab ye connection My Thekedar / My Karigar me dikhega."
          : "Booking request reject kar di gayi."
      );
    } catch (error) {
      setSnackbarMessage(error instanceof Error ? error.message : "Booking update fail ho gaya.");
    }
  }

  async function openBookingChat(booking: BookingListItem) {
    if (!ensureConnectAccess("Chat")) {
      return;
    }

    if (!booking.counterparty?.userId) {
      setSnackbarMessage("Is booking ke liye chat participant nahi mila.");
      return;
    }

    try {
      setChatLoading(true);
      const response = await getOrCreateChatThread({
        participantUserId: booking.counterparty.userId,
        bookingId: booking.id
      });
      setChatThread(response.item);
      setChatDraft("");
      setChatOpen(true);
    } catch (error) {
      setSnackbarMessage(error instanceof Error ? error.message : "Chat open nahi hui.");
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
      setSnackbarMessage(error instanceof Error ? error.message : "Message send nahi hua.");
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
    <>
      <MobileShell title="Bookings" subtitle="Track work, hajri and payment status">
        <Stack spacing={2}>
          <Card>
            <CardContent sx={{ p: 1 }}>
              <Tabs value={tab} onChange={(_event, value) => setTab(value)} variant="fullWidth">
                <Tab label="Active" />
                <Tab label="Pending" />
                <Tab label="Completed" />
              </Tabs>
            </CardContent>
          </Card>

          <Stack spacing={1.5}>
            {loading ? <LinearProgress sx={{ borderRadius: 999 }} /> : null}
            {visibleBookings.map((booking) => (
              <Card key={booking.id}>
                <CardContent sx={{ p: 2 }}>
                  <Stack spacing={1.2}>
                    <div>
                      <Typography variant="subtitle1" fontWeight={700}>
                        {booking.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {booking.party}
                      </Typography>
                    </div>
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        Progress
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={booking.progress}
                        sx={{ height: 10, borderRadius: 999 }}
                      />
                    </Box>
                    <Typography variant="subtitle2" color="primary.main">
                      {booking.amount}
                    </Typography>
                    <Stack direction="row" spacing={1}>
                      {authUser?.role === "carpenter" && statusKey === "pending" ? (
                        <>
                          <Button
                            variant="contained"
                            fullWidth
                            onClick={() => handleBookingDecision(booking.id, "accepted")}
                          >
                            Accept
                          </Button>
                          <Button
                            variant="outlined"
                            fullWidth
                            onClick={() => handleBookingDecision(booking.id, "rejected")}
                          >
                            Reject
                          </Button>
                        </>
                      ) : authUser?.role === "carpenter" ? (
                        <Button
                          startIcon={<ChatRoundedIcon />}
                          variant="contained"
                          fullWidth
                          onClick={() => openBookingChat(booking)}
                        >
                          Chat
                        </Button>
                      ) : (
                        <>
                          <Button
                            startIcon={<ChatRoundedIcon />}
                            variant="contained"
                            fullWidth
                            onClick={() => openBookingChat(booking)}
                          >
                            Chat
                          </Button>
                          <Button
                            startIcon={<CallRoundedIcon />}
                            variant="outlined"
                            fullWidth
                            onClick={() => handleBookingAdvance(booking.id)}
                          >
                            Mark settled
                          </Button>
                        </>
                      )}
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            ))}
            {visibleBookings.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                Is tab me abhi koi booking nahi hai.
              </Typography>
            ) : null}
          </Stack>

          <Typography variant="subtitle1" fontWeight={700}>
            Hajri approval queue
          </Typography>
          <Stack spacing={1.5}>
            {logs.map((log) => (
              <Box key={log.id}>
                <AttendanceCard {...log} />
                {!log.approved ? (
                  <Button
                    sx={{ mt: 1 }}
                    variant="outlined"
                    fullWidth
                    onClick={() => markAttendanceApproved(log.id)}
                  >
                    Approve attendance
                  </Button>
                ) : null}
              </Box>
            ))}
          </Stack>
        </Stack>
      </MobileShell>
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
                      <Typography variant="caption" sx={{ display: "block", mt: 0.75, opacity: 0.75, textAlign: ownMessage ? "right" : "left" }}>
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
      <Snackbar
        open={Boolean(snackbarMessage)}
        autoHideDuration={2500}
        onClose={() => setSnackbarMessage("")}
        message={snackbarMessage}
      />
    </>
  );
}
