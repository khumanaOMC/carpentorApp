"use client";

import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import ApartmentRoundedIcon from "@mui/icons-material/ApartmentRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import HomeRepairServiceRoundedIcon from "@mui/icons-material/HomeRepairServiceRounded";
import PersonSearchRoundedIcon from "@mui/icons-material/PersonSearchRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import WorkHistoryRoundedIcon from "@mui/icons-material/WorkHistoryRounded";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Avatar, Box, Button, Card, CardContent, CircularProgress, Snackbar, Stack, Typography } from "@mui/material";
import { MobileShell } from "@/components/app-shell/mobile-shell";
import { HeroOverviewCard } from "@/components/cards/hero-overview-card";
import { SectionCard } from "@/components/cards/section-card";
import { StatusCard } from "@/components/cards/status-card";
import { homeSections, quickActions, roleStats } from "@/lib/app-data";
import { Pill } from "@/components/ui/pill";
import { getCarpenters, getContractors, type CarpenterDirectoryItem, type ContractorDirectoryItem } from "@/lib/api/profile";
import { useAppLanguage } from "@/components/providers/app-language-provider";
import { appDictionary } from "@/lib/i18n";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const entryCards = [
  {
    title: "Karigar bano",
    subtitle: "Profile, portfolio aur thekedar offers ke saath kaam lo.",
    href: "/register?role=carpenter",
    icon: <HomeRepairServiceRoundedIcon />
  },
  {
    title: "Thekedar join karo",
    subtitle: "Karigar hire karo, hajri approve karo aur settlement track karo.",
    href: "/register?role=contractor",
    icon: <ApartmentRoundedIcon />
  },
  {
    title: "Customer account",
    subtitle: "Nearby carpenter search karo aur direct booking request bhejo.",
    href: "/register?role=customer",
    icon: <PersonSearchRoundedIcon />
  }
];

export function HomeScreen() {
  const { language } = useAppLanguage();
  const dictionary = appDictionary[language];
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [topCarpenters, setTopCarpenters] = useState<CarpenterDirectoryItem[]>([]);
  const [topContractors, setTopContractors] = useState<ContractorDirectoryItem[]>([]);
  const [loadingListings, setLoadingListings] = useState(true);

  useEffect(() => {
    function onBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
  }, []);

  useEffect(() => {
    let active = true;

    async function loadHomeListings() {
      setLoadingListings(true);
      try {
        const [carpentersResponse, contractorsResponse] = await Promise.all([
          getCarpenters(),
          getContractors()
        ]);

        if (!active) return;

        setTopCarpenters(
          [...carpentersResponse.items]
            .sort((a, b) => {
              if (b.averageRating !== a.averageRating) return b.averageRating - a.averageRating;
              return b.experienceYears - a.experienceYears;
            })
            .slice(0, 10)
        );

        setTopContractors(contractorsResponse.items.slice(0, 10));
      } catch (error) {
        if (active) {
          setSnackbarMessage(error instanceof Error ? error.message : "Top listings load nahi hui.");
        }
      } finally {
        if (active) {
          setLoadingListings(false);
        }
      }
    }

    loadHomeListings();
    return () => {
      active = false;
    };
  }, []);

  async function installApp() {
    if (!installPrompt) {
      setSnackbarMessage("Browser install prompt not available right now");
      return;
    }

    await installPrompt.prompt();
    const result = await installPrompt.userChoice;
    setSnackbarMessage(
      result.outcome === "accepted" ? "App install accepted" : "Install prompt dismissed"
    );
    setInstallPrompt(null);
  }

  return (
    <>
      <MobileShell title="Home" subtitle="Discover, hire, track and settle">
        <Stack spacing={2}>
          <HeroOverviewCard />

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: 1.5
            }}
          >
            {roleStats.map((stat) => (
              <Box key={stat.label}>
                <StatusCard label={stat.label} value={stat.value} />
              </Box>
            ))}
          </Box>

          <Box>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
              {dictionary.home.quickActions}
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {quickActions.map((item) => (
                <Stack key={item} direction="row" spacing={0.8} alignItems="center">
                  <BoltRoundedIcon sx={{ fontSize: 18, color: "primary.main" }} />
                  <Pill label={item} />
                </Stack>
              ))}
            </Stack>
          </Box>

          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.2 }}>
              <div>
                <Typography variant="h6" fontWeight={800}>
                  {dictionary.home.topThekedar}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {dictionary.home.topThekedarSubtitle}
                </Typography>
              </div>
              <Button component={Link} href="/my-thekedar" size="small">
                {dictionary.home.viewAll}
              </Button>
            </Stack>
            {loadingListings ? <CircularProgress size={22} /> : null}
            <Box
              sx={{
                display: "grid",
                gridAutoFlow: "column",
                gridAutoColumns: "minmax(248px, 78%)",
                gap: 1.5,
                overflowX: "auto",
                pb: 1,
                scrollSnapType: "x proximity",
                "&::-webkit-scrollbar": { display: "none" }
              }}
            >
              {topContractors.map((item) => (
                <Card
                  key={item.id}
                  sx={{
                    scrollSnapAlign: "start",
                    borderRadius: "5px",
                    border: "1px solid rgba(111,69,39,0.12)"
                  }}
                >
                  <CardContent sx={{ p: 2 }}>
                    <Stack spacing={1.4}>
                      <Stack direction="row" spacing={1.2} alignItems="center">
                        <Avatar src={item.profilePhotoUrl || undefined} sx={{ width: 52, height: 52, bgcolor: "primary.main" }}>
                          {item.fullName.slice(0, 2).toUpperCase()}
                        </Avatar>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography fontWeight={800} noWrap>
                            {item.fullName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" noWrap>
                            {item.city} • {item.type}
                          </Typography>
                        </Box>
                      </Stack>
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        <Pill label={`${item.averageRating.toFixed(1)} ${dictionary.home.topRated}`} tone="warning" />
                        <Pill label={`${item.activeJobs} ${dictionary.home.activeJobs}`} tone="soft" />
                      </Stack>
                      <Typography variant="body2" color="text.secondary" sx={{ minHeight: 42 }}>
                        {item.bio || "Verified thekedar with active carpentry projects."}
                      </Typography>
                      <Stack direction="row" spacing={1.5}>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <WorkHistoryRoundedIcon sx={{ fontSize: 16, color: "primary.main" }} />
                          <Typography variant="caption">{item.totalJobs} jobs</Typography>
                        </Stack>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <StarRoundedIcon sx={{ fontSize: 16, color: "warning.main" }} />
                          <Typography variant="caption">{item.completedJobs} {dictionary.home.completed}</Typography>
                        </Stack>
                      </Stack>
                      <Button component={Link} href="/contractors" variant="outlined" fullWidth>
                        View details
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Box>

          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.2 }}>
              <div>
                <Typography variant="h6" fontWeight={800}>
                  {dictionary.home.topKarigar}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {dictionary.home.topKarigarSubtitle}
                </Typography>
              </div>
              <Button component={Link} href="/carpenters" size="small">
                {dictionary.home.viewAll}
              </Button>
            </Stack>
            {loadingListings ? null : (
              <Box
                sx={{
                  display: "grid",
                  gridAutoFlow: "column",
                  gridAutoColumns: "minmax(248px, 78%)",
                  gap: 1.5,
                  overflowX: "auto",
                  pb: 1,
                  scrollSnapType: "x proximity",
                  "&::-webkit-scrollbar": { display: "none" }
                }}
              >
                {topCarpenters.map((item) => (
                  <Card
                    key={item.id}
                    sx={{
                      scrollSnapAlign: "start",
                      borderRadius: "5px",
                      border: "1px solid rgba(111,69,39,0.12)"
                    }}
                  >
                    <CardContent sx={{ p: 2 }}>
                      <Stack spacing={1.4}>
                        <Stack direction="row" spacing={1.2} alignItems="center">
                          <Avatar src={item.profilePhotoUrl || undefined} sx={{ width: 52, height: 52, bgcolor: "primary.main" }}>
                            {item.fullName.slice(0, 2).toUpperCase()}
                          </Avatar>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography fontWeight={800} noWrap>
                              {item.fullName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" noWrap>
                              {item.city} • {item.experienceYears} yrs
                            </Typography>
                          </Box>
                        </Stack>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                          <Pill label={`${item.averageRating.toFixed(1)} ${dictionary.home.topRated}`} tone="warning" />
                          <Pill
                            label={item.availabilityStatus === "available" ? dictionary.home.availableNow : item.availabilityStatus}
                            tone={item.availabilityStatus === "available" ? "success" : "soft"}
                          />
                        </Stack>
                        <Typography variant="body2" color="text.secondary" sx={{ minHeight: 42 }}>
                          {(item.skills || []).slice(0, 3).join(", ")}
                        </Typography>
                        <Stack direction="row" spacing={1.5}>
                          <Typography variant="caption">₹{item.rateCard?.daily || 0}/day</Typography>
                          <Typography variant="caption">{item.kycStatus === "approved" ? dictionary.home.kycVerified : dictionary.home.kycPending}</Typography>
                        </Stack>
                        <Button component={Link} href="/carpenters" variant="outlined" fullWidth>
                          View details
                        </Button>
                      </Stack>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}
          </Box>

          <Stack spacing={1.5}>
            {homeSections.map((section) => (
              <SectionCard
                key={section.title}
                title={section.title}
                subtitle={section.subtitle}
                items={section.items}
              />
            ))}
          </Stack>

          <Card
            sx={{
              background:
                "linear-gradient(180deg, rgba(255,250,244,0.98), rgba(244,236,223,0.95))",
              border: "1px solid rgba(111,69,39,0.08)"
            }}
          >
            <CardContent sx={{ p: 2.1 }}>
              <Stack spacing={1.6}>
                <div>
                  <Typography variant="h6" fontWeight={800}>
                    {dictionary.home.appEntryTitle}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {dictionary.home.appEntrySubtitle}
                  </Typography>
                </div>

                <Stack spacing={1.15}>
                  {entryCards.map((item) => (
                    <Card
                      key={item.title}
                      variant="outlined"
                      sx={{
                        borderRadius: 5,
                        borderColor: "rgba(111,69,39,0.14)",
                        boxShadow: "none"
                      }}
                    >
                      <CardContent sx={{ p: 1.5 }}>
                        <Stack direction="row" spacing={1.3} alignItems="center">
                          <Box
                            sx={{
                              width: 44,
                              height: 44,
                              borderRadius: 3.5,
                              display: "grid",
                              placeItems: "center",
                              bgcolor: "secondary.light",
                              color: "primary.main"
                            }}
                          >
                            {item.icon}
                          </Box>
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography fontWeight={800}>{item.title}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {item.subtitle}
                            </Typography>
                          </Box>
                          <Button
                            component={Link}
                            href={item.href}
                            variant="text"
                            endIcon={<ArrowForwardRoundedIcon />}
                            sx={{ whiteSpace: "nowrap" }}
                          >
                            Start
                          </Button>
                        </Stack>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>

                <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                  <Button component={Link} href="/register" variant="contained" fullWidth size="large">
                    {dictionary.home.createAccount}
                  </Button>
                  <Button component={Link} href="/login" variant="outlined" fullWidth size="large">
                    {dictionary.home.login}
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          <Button variant="contained" size="large" fullWidth onClick={installApp}>
            {dictionary.header.installApp}
          </Button>
        </Stack>
      </MobileShell>
      <Snackbar
        open={Boolean(snackbarMessage)}
        autoHideDuration={2500}
        onClose={() => setSnackbarMessage("")}
        message={snackbarMessage}
      />
    </>
  );
}
