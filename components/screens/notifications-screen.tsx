"use client";

import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import { useEffect, useMemo, useState } from "react";
import { Alert, Button, Card, CardContent, CircularProgress, Stack, Typography } from "@mui/material";
import { MobileShell } from "@/components/app-shell/mobile-shell";
import { Pill } from "@/components/ui/pill";
import { getNotifications, markNotificationRead, type NotificationItem } from "@/lib/api/notifications";

export function NotificationsScreen() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function loadNotifications() {
      setLoading(true);
      try {
        const response = await getNotifications();
        if (active) {
          setItems(response.items);
        }
      } catch (error) {
        if (active) {
          setMessage(error instanceof Error ? error.message : "Notifications load nahi hui.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadNotifications();
    return () => {
      active = false;
    };
  }, []);

  const unreadCount = useMemo(() => items.filter((item) => !item.isRead).length, [items]);

  async function handleRead(id: string) {
    try {
      await markNotificationRead(id);
      setItems((current) => current.map((item) => (item.id === id ? { ...item, isRead: true } : item)));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Notification read update nahi hui.");
    }
  }

  return (
    <MobileShell title="Notifications" subtitle="Booking, profile aur payment updates">
      <Stack spacing={2}>
        <Card>
          <CardContent sx={{ p: 2 }}>
            <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="space-between">
              <Stack direction="row" spacing={1.25} alignItems="center">
                <NotificationsRoundedIcon color="primary" />
                <Typography variant="subtitle1" fontWeight={700}>
                  Unread notifications
                </Typography>
              </Stack>
              <Pill label={`${unreadCount} unread`} tone={unreadCount > 0 ? "warning" : "soft"} />
            </Stack>
          </CardContent>
        </Card>

        {message ? <Alert severity="error">{message}</Alert> : null}
        {loading ? <CircularProgress size={26} /> : null}

        <Stack spacing={1.5}>
          {items.map((item) => (
            <Card key={item.id}>
              <CardContent sx={{ p: 2 }}>
                <Stack spacing={1}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1}>
                    <Typography variant="subtitle1" fontWeight={700}>
                      {item.title}
                    </Typography>
                    <Pill label={item.isRead ? "Read" : "New"} tone={item.isRead ? "soft" : "warning"} />
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    {item.body}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(item.createdAt).toLocaleString("en-IN")}
                  </Typography>
                  {!item.isRead ? (
                    <Button variant="outlined" onClick={() => handleRead(item.id)}>
                      Mark as read
                    </Button>
                  ) : null}
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      </Stack>
    </MobileShell>
  );
}
