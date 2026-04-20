"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import WorkRoundedIcon from "@mui/icons-material/WorkRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import PersonAddAlt1RoundedIcon from "@mui/icons-material/PersonAddAlt1Rounded";
import AdminPanelSettingsRoundedIcon from "@mui/icons-material/AdminPanelSettingsRounded";
import LoginRoundedIcon from "@mui/icons-material/LoginRounded";
import ManageAccountsRoundedIcon from "@mui/icons-material/ManageAccountsRounded";
import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";
import LightModeRoundedIcon from "@mui/icons-material/LightModeRounded";
import AccountCircleRoundedIcon from "@mui/icons-material/AccountCircleRounded";
import {
  AppBar,
  Badge,
  BottomNavigation,
  BottomNavigationAction,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  Toolbar,
  Typography,
  type SelectChangeEvent
} from "@mui/material";
import { drawerLinks } from "@/lib/app-data";
import { getAuthUser } from "@/lib/auth-storage";
import { KkcLogo } from "@/components/branding/kkc-logo";
import { useThemeMode } from "@/components/providers/app-theme-provider";
import { useAppLanguage } from "@/components/providers/app-language-provider";
import { type AppLanguage } from "@/lib/app-preferences";
import { appDictionary } from "@/lib/i18n";
import { getIncomingCarpenterRequests } from "@/lib/api/account";
import { getBookings } from "@/lib/api/marketplace";

type MobileShellProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

const protectedPaths = new Set([
  "/bookings",
  "/profile",
  "/my-account",
  "/my-thekedar",
  "/my-karigar",
  "/notifications"
]);

function getRoleAwareDrawerLinks(role: string | undefined, language: AppLanguage) {
  const dictionary = appDictionary[language];

  return drawerLinks
    .filter((link) => {
      if (link.href === "/login" || link.href === "/register" || link.href === "/forgot-password") {
        return !role;
      }

      if (link.href === "/admin") {
        return role === "admin";
      }

      if (link.href === "/my-thekedar") {
        return role === "carpenter";
      }

      if (link.href === "/my-karigar") {
        return role === "contractor" || role === "customer";
      }

      if (link.href === "/carpenters") {
        return role !== "carpenter";
      }

      return true;
    })
    .map((link) => {
      if (link.href === "/my-thekedar") {
        return {
          ...link,
          label: role === "carpenter" ? dictionary.drawer.thekedarOffers : dictionary.drawer.myThekedar
        };
      }

      if (link.href === "/my-karigar") {
        return {
          ...link,
          label: role === "carpenter" ? dictionary.drawer.myHajri : dictionary.drawer.myKarigar
        };
      }

      if (link.href === "/carpenters") {
        return {
          ...link,
          label: role === "contractor" || role === "customer" ? dictionary.drawer.findKarigar : dictionary.drawer.carpenters
        };
      }

      return link;
    });
}

function getRoleAwareTabs(role: string | undefined, dictionary: (typeof appDictionary)[AppLanguage]) {
  if (role === "carpenter") {
    return [
      { href: "/", label: dictionary.bottomNav.home, icon: <HomeRoundedIcon /> },
      { href: "/jobs", label: dictionary.bottomNav.jobs, icon: <WorkRoundedIcon /> },
      { href: "/bookings", label: dictionary.bottomNav.bookings, icon: <CalendarMonthRoundedIcon /> },
      { href: "/my-thekedar", label: dictionary.drawer.thekedarOffers, icon: <WorkRoundedIcon /> },
      { href: "/profile", label: dictionary.bottomNav.profile, icon: <PersonRoundedIcon /> }
    ];
  }

  return [
    { href: "/", label: dictionary.bottomNav.home, icon: <HomeRoundedIcon /> },
    { href: "/carpenters", label: role === "contractor" || role === "customer" ? dictionary.drawer.findKarigar : dictionary.bottomNav.carpenters, icon: <WorkRoundedIcon /> },
    { href: "/jobs", label: dictionary.bottomNav.jobs, icon: <WorkRoundedIcon /> },
    { href: "/bookings", label: dictionary.bottomNav.bookings, icon: <CalendarMonthRoundedIcon /> },
    { href: "/profile", label: dictionary.bottomNav.profile, icon: <PersonRoundedIcon /> }
  ];
}

export function MobileShell({ title: _title, subtitle: _subtitle, children }: MobileShellProps) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [requestCount, setRequestCount] = useState(0);
  const authUser = getAuthUser();
  const { mode, toggleMode } = useThemeMode();
  const { language, setLanguage } = useAppLanguage();
  const dictionary = appDictionary[language];
  const tabs = getRoleAwareTabs(authUser?.role, dictionary);
  const currentValue = tabs.find((tab) => tab.href === pathname)?.href ?? "/";
  const avatarLabel = authUser?.fullName?.split(" ").map((item) => item[0]).slice(0, 2).join("").toUpperCase() || "";
  const roleAwareLinks = getRoleAwareDrawerLinks(authUser?.role, language);
  const requestHref = authUser?.role === "carpenter" ? "/my-thekedar" : "/my-karigar";

  useEffect(() => {
    let active = true;

    async function loadRequestCount() {
      try {
        if (authUser?.role === "contractor") {
          const response = await getIncomingCarpenterRequests();
          if (active) {
            setRequestCount(response.items.length);
          }
          return;
        }

        if (authUser?.role === "carpenter") {
          const response = await getBookings({ status: "pending" });
          if (active) {
            setRequestCount(response.items.length);
          }
          return;
        }

        if (active) {
          setRequestCount(0);
        }
      } catch {
        if (active) {
          setRequestCount(0);
        }
      }
    }

    loadRequestCount();
    return () => {
      active = false;
    };
  }, [authUser?.role, pathname]);

  function handleLanguageChange(event: SelectChangeEvent) {
    setLanguage(event.target.value as AppLanguage);
  }

  function getGuardedHref(href: string) {
    if (authUser || !protectedPaths.has(href)) {
      return href;
    }

    return `/login?redirect=${encodeURIComponent(href)}`;
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        backgroundImage:
          mode === "dark"
            ? "radial-gradient(circle at top, rgba(243,197,110,0.08), transparent 24%), linear-gradient(180deg, rgba(18,15,14,1), rgba(15,13,13,1))"
            : "linear-gradient(180deg, rgba(255,250,244,0.95), rgba(247,241,232,1))"
      }}
    >
      <AppBar position="sticky">
        <Toolbar sx={{ px: 2, minHeight: 68 }}>
          <IconButton edge="start" color="inherit" onClick={() => setDrawerOpen(true)}>
            <MenuRoundedIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1, ml: 1, display: "flex", alignItems: "center", gap: 1.1 }}>
            <KkcLogo variant="mark" size={38} />
            <Select
              size="small"
              value={language}
              onChange={handleLanguageChange}
              sx={{
                minWidth: 106,
                height: 38,
                borderRadius: "10px",
                "& .MuiSelect-select": {
                  py: 0.45,
                  pr: 3.5,
                  pl: 1.25,
                  fontSize: 12.5,
                  fontWeight: 700
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(111,69,39,0.16)"
                }
              }}
            >
              <MenuItem value="hi">{dictionary.languageNames.hi}</MenuItem>
              <MenuItem value="en">{dictionary.languageNames.en}</MenuItem>
              <MenuItem value="ta">{dictionary.languageNames.ta}</MenuItem>
              <MenuItem value="kn">{dictionary.languageNames.kn}</MenuItem>
            </Select>
          </Box>
          <IconButton color="inherit" onClick={toggleMode} sx={{ mr: 0.5 }}>
            {mode === "dark" ? <LightModeRoundedIcon /> : <DarkModeRoundedIcon />}
          </IconButton>
          {authUser?.role === "contractor" || authUser?.role === "carpenter" ? (
            <IconButton component={Link} href={getGuardedHref(requestHref)} color="inherit" sx={{ mr: 0.5 }}>
              <Badge color="error" badgeContent={requestCount}>
                <PersonAddAlt1RoundedIcon />
              </Badge>
            </IconButton>
          ) : null}
          <IconButton component={Link} href={getGuardedHref("/notifications")} color="inherit" sx={{ mr: 1 }}>
            <Badge color="error" badgeContent={3}>
              <NotificationsRoundedIcon />
            </Badge>
          </IconButton>
          <IconButton component={Link} href={getGuardedHref("/my-account")} color="inherit" sx={{ p: 0 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 999,
                display: "grid",
                placeItems: "center",
                bgcolor: "primary.main",
                color: "primary.contrastText",
                fontWeight: 700,
                fontSize: 13
              }}
            >
              {authUser ? avatarLabel : <AccountCircleRoundedIcon sx={{ fontSize: 22 }} />}
            </Box>
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box component="main" sx={{ px: 2, pt: 2, pb: 12, maxWidth: 560, mx: "auto" }}>
        {children}
      </Box>

      <Box
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          bgcolor: mode === "dark" ? "rgba(18,15,14,0.94)" : "rgba(255,250,244,0.96)",
          backdropFilter: "blur(14px)"
        }}
      >
        <BottomNavigation showLabels value={currentValue}>
          {tabs.map((tab) => (
            <BottomNavigationAction
              key={tab.href}
              component={Link}
              href={getGuardedHref(tab.href)}
              label={tab.label}
              value={tab.href}
              icon={tab.icon}
            />
          ))}
        </BottomNavigation>
      </Box>

      <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 280, p: 2 }}>
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
            <KkcLogo size={42} />
          </Stack>
          <Divider sx={{ mb: 1 }} />
          <List>
            {roleAwareLinks.map((link) => (
              <ListItemButton
                key={link.href}
                component={Link}
                href={getGuardedHref(link.href)}
                selected={pathname === link.href}
                onClick={() => setDrawerOpen(false)}
                sx={{ borderRadius: 3, mb: 0.5 }}
              >
                <ListItemText primary={link.label} />
              </ListItemButton>
            ))}
          </List>
          <Divider sx={{ my: 1 }} />
          <ListItemButton
            onClick={toggleMode}
            sx={{ borderRadius: 3, mb: 1.5, bgcolor: "action.hover" }}
          >
            <ListItemText primary={mode === "dark" ? dictionary.drawer.switchToLight : dictionary.drawer.switchToDark} />
            {mode === "dark" ? <LightModeRoundedIcon /> : <DarkModeRoundedIcon />}
          </ListItemButton>
          <Stack direction="row" spacing={1}>
            <LoginRoundedIcon color="primary" />
            <Typography variant="body2" color="text.secondary">
              Login, register aur admin flows bhi app shell me available hain.
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
            <ManageAccountsRoundedIcon color="primary" />
            <Typography variant="body2" color="text.secondary">
              Role ke hisaab se Thekedar, Karigar aur Hajri shortcuts yahan smart tareeke se dikhenge.
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
            <AdminPanelSettingsRoundedIcon color="primary" />
            <Typography variant="body2" color="text.secondary">
              Future me role-based drawer shortcuts yahin aayenge.
            </Typography>
          </Stack>
        </Box>
      </Drawer>
    </Box>
  );
}
