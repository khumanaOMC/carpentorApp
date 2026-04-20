"use client";

import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import { type ChangeEvent, useEffect, useMemo, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Input,
  Snackbar,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { MobileShell } from "@/components/app-shell/mobile-shell";
import { ProfileSummaryCard } from "@/components/profile/profile-summary-card";
import { Pill } from "@/components/ui/pill";
import { getMyProfile, updateMyProfile } from "@/lib/api/profile";

export function ProfileScreen() {
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [profile, setProfile] = useState({
    fullName: "",
    mobile: "",
    city: "",
    state: "",
    pincode: "",
    address: "",
    experienceYears: "",
    skills: "",
    availabilityStatus: "available",
    dailyRate: "",
    halfDayRate: "",
    oneAndHalfDayRate: "",
    monthlyRate: "",
    overtimeRate: "",
    role: "customer",
    bio: "",
    contractorType: "individual",
    customerType: "homeowner",
    kycStatus: "pending",
    averageRating: 0,
    totalEarnings: 0,
    profilePhotoUrl: "",
    portfolioUrls: ""
  });

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      setLoading(true);
      try {
        const response = await getMyProfile();
        const user = response.user;
        const roleProfile = user.profile || {};

        if (!active) return;

        setProfile({
          fullName: user.fullName || "",
          mobile: user.mobile || "",
          city:
            roleProfile.currentLocation?.city
            || roleProfile.businessLocation?.city
            || roleProfile.address?.city
            || "",
          state:
            roleProfile.currentLocation?.state
            || roleProfile.businessLocation?.state
            || roleProfile.address?.state
            || "",
          pincode:
            roleProfile.currentLocation?.pincode
            || roleProfile.businessLocation?.pincode
            || roleProfile.address?.pincode
            || "",
          address: roleProfile.businessLocation?.address || roleProfile.address?.fullAddress || "",
          experienceYears: String(roleProfile.experienceYears || ""),
          skills: (roleProfile.skills || []).join(", "),
          availabilityStatus: roleProfile.availabilityStatus || "available",
          dailyRate: String(roleProfile.rateCard?.daily || ""),
          halfDayRate: String(roleProfile.rateCard?.halfDay || ""),
          oneAndHalfDayRate: String(roleProfile.rateCard?.oneAndHalfDay || ""),
          monthlyRate: String(roleProfile.rateCard?.monthly || ""),
          overtimeRate: String(roleProfile.rateCard?.overtimePerHour || ""),
          role: user.role,
          bio: roleProfile.bio || "",
          contractorType: roleProfile.profileType || "individual",
          customerType: roleProfile.profileType || "homeowner",
          kycStatus: roleProfile.kycStatus || "pending",
          averageRating: roleProfile.averageRating || 0,
          totalEarnings: roleProfile.totalEarnings || 0,
          profilePhotoUrl: roleProfile.profilePhotoUrl || "",
          portfolioUrls: (roleProfile.portfolioItems || []).map((item) => item.url).join("\n")
        });
      } catch (error) {
        if (active) {
          setMessage(error instanceof Error ? error.message : "Profile load nahi hua.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadProfile();
    return () => {
      active = false;
    };
  }, []);

  const ratePills = useMemo(
    () => [
      profile.dailyRate ? `Daily ₹${profile.dailyRate}` : null,
      profile.halfDayRate ? `Half day ₹${profile.halfDayRate}` : null,
      profile.oneAndHalfDayRate ? `1.5 day ₹${profile.oneAndHalfDayRate}` : null,
      profile.monthlyRate ? `Monthly ₹${profile.monthlyRate}` : null,
      profile.overtimeRate ? `Overtime ₹${profile.overtimeRate}/hr` : null
    ].filter(Boolean) as string[],
    [profile.dailyRate, profile.halfDayRate, profile.oneAndHalfDayRate, profile.monthlyRate, profile.overtimeRate]
  );

  const portfolioItems = useMemo(
    () =>
      profile.portfolioUrls
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean)
        .map((url, index) => ({
          id: `${url}-${index}`,
          url,
          mediaType:
            url.includes("youtube") || url.includes("youtu.be") || url.endsWith(".mp4") ? "video" : "image"
        })),
    [profile.portfolioUrls]
  );

  const profileAccordions = useMemo(() => {
    const skillList = profile.skills.split(",").map((item) => item.trim()).filter(Boolean);

    return [
      {
        title: "Experience and skills",
        summary: skillList.length > 0 ? `${skillList.length} skills added` : "Add your core skills",
        lines: [
          `Experience: ${profile.experienceYears || 0} years`,
          `Skills: ${skillList.length > 0 ? skillList.join(", ") : "Abhi add nahi kiya"}`
        ]
      },
      {
        title: "Work location and availability",
        summary: profile.city || "Add city and availability",
        lines: [
          `City: ${profile.city || "Not added"}`,
          `State: ${profile.state || "Not added"}`,
          `Availability: ${profile.availabilityStatus || "available"}`
        ]
      },
      {
        title: "Rate card",
        summary: profile.dailyRate ? `Daily ₹${profile.dailyRate}` : "Add your rate card",
        lines: [
          `Half day: ₹${profile.halfDayRate || 0}`,
          `1 day: ₹${profile.dailyRate || 0}`,
          `1.5 day: ₹${profile.oneAndHalfDayRate || 0}`,
          `Monthly: ₹${profile.monthlyRate || 0}`,
          `Overtime: ₹${profile.overtimeRate || 0}/hr`
        ]
      },
      {
        title: "Portfolio and photo",
        summary: portfolioItems.length > 0 ? `${portfolioItems.length} portfolio items` : "Add photo and work samples",
        lines: [
          `Profile photo: ${profile.profilePhotoUrl ? "Added" : "Not added"}`,
          `Portfolio items: ${portfolioItems.length}`,
          `Bio: ${profile.bio ? "Added" : "Not added"}`
        ]
      },
      {
        title: "Profile readiness",
        summary: "Check what is still missing",
        lines: [
          profile.fullName ? "Name added" : "Name missing",
          profile.mobile ? "Mobile added" : "Mobile missing",
          profile.pincode ? "PIN code added" : "PIN code missing",
          profile.role === "carpenter" && skillList.length === 0 ? "Add at least one skill" : "Skills look okay"
        ]
      }
    ];
  }, [
    portfolioItems.length,
    profile.availabilityStatus,
    profile.bio,
    profile.city,
    profile.dailyRate,
    profile.experienceYears,
    profile.fullName,
    profile.halfDayRate,
    profile.mobile,
    profile.monthlyRate,
    profile.oneAndHalfDayRate,
    profile.overtimeRate,
    profile.pincode,
    profile.profilePhotoUrl,
    profile.role,
    profile.skills,
    profile.state
  ]);

  function buildProfilePayload(overrides?: Partial<typeof profile>) {
    const nextProfile = { ...profile, ...overrides };

    return {
      fullName: nextProfile.fullName,
      mobile: nextProfile.mobile,
      city: nextProfile.city,
      state: nextProfile.state,
      pincode: nextProfile.pincode,
      address: nextProfile.address,
      bio: nextProfile.bio,
      contractorType: nextProfile.contractorType,
      customerType: nextProfile.customerType,
      experienceYears: Number(nextProfile.experienceYears || 0),
      skills: nextProfile.skills.split(",").map((item) => item.trim()).filter(Boolean),
      availabilityStatus: nextProfile.availabilityStatus,
      dailyRate: Number(nextProfile.dailyRate || 0),
      halfDayRate: Number(nextProfile.halfDayRate || 0),
      oneAndHalfDayRate: Number(nextProfile.oneAndHalfDayRate || 0),
      monthlyRate: Number(nextProfile.monthlyRate || 0),
      overtimeRate: Number(nextProfile.overtimeRate || 0),
      profilePhotoUrl: nextProfile.profilePhotoUrl,
      portfolioItems: nextProfile.portfolioUrls
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean)
        .map((url) => ({
          mediaType:
            url.includes("youtube") || url.includes("youtu.be") || url.endsWith(".mp4") ? "video" : "image",
          url,
          caption: "Portfolio item"
        }))
    };
  }

  async function saveProfile() {
    try {
      await updateMyProfile(buildProfilePayload());
      setSaved(true);
      setMessage("Profile successfully save ho gayi.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Profile save fail ho gayi.");
    }
  }

  async function handleProfilePhotoUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage("Sirf image file upload karo.");
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      setMessage("Photo 4MB se chhoti rakho.");
      return;
    }

    setUploadingPhoto(true);
    setMessage("");

    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ""));
        reader.onerror = () => reject(new Error("Photo read nahi ho paayi."));
        reader.readAsDataURL(file);
      });

      setProfile((current) => ({ ...current, profilePhotoUrl: dataUrl }));
      await updateMyProfile(buildProfilePayload({ profilePhotoUrl: dataUrl }));
      setSaved(true);
      setMessage("Profile photo save ho gayi.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Photo upload prepare nahi ho paaya.");
    } finally {
      setUploadingPhoto(false);
      event.target.value = "";
    }
  }

  return (
    <>
      <MobileShell title="Profile" subtitle="Manage rates, KYC, portfolio and settings">
        <Stack spacing={2}>
          {loading ? <CircularProgress size={26} /> : null}
          <ProfileSummaryCard
            initials={profile.fullName ? profile.fullName.split(" ").map((item) => item[0]).slice(0, 2).join("") : "KK"}
            name={profile.fullName || "Your profile"}
            subtitle={`${profile.city || "City"} • ${profile.role} • ${profile.availabilityStatus}`}
            rating={profile.averageRating || 0}
            kycVerified={profile.kycStatus === "approved"}
            availableLabel={profile.availabilityStatus}
            earningsLabel={`₹${profile.totalEarnings || 0} total earnings`}
            workLabel={`${profile.experienceYears || 0} years experience`}
            photoUrl={profile.profilePhotoUrl}
          />

          <Card>
            <CardContent sx={{ p: 2 }}>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {ratePills.length > 0 ? ratePills.map((item) => <Pill key={item} label={item} />) : <Pill label="Rates add karo" tone="outlined" />}
              </Stack>
            </CardContent>
          </Card>

          <Card>
            <CardContent sx={{ p: 2 }}>
              <Stack spacing={1.5}>
                <TextField
                  label="Full Name"
                  value={profile.fullName}
                  onChange={(event) => setProfile((current) => ({ ...current, fullName: event.target.value }))}
                />
                <TextField
                  label="Mobile"
                  value={profile.mobile}
                  onChange={(event) => setProfile((current) => ({ ...current, mobile: event.target.value }))}
                />
                <TextField
                  label="City"
                  value={profile.city}
                  onChange={(event) => setProfile((current) => ({ ...current, city: event.target.value }))}
                />
                <TextField
                  label="State"
                  value={profile.state}
                  onChange={(event) => setProfile((current) => ({ ...current, state: event.target.value }))}
                />
                <TextField
                  label="PIN code"
                  value={profile.pincode}
                  onChange={(event) => setProfile((current) => ({ ...current, pincode: event.target.value }))}
                />
                <TextField
                  label="Address"
                  value={profile.address}
                  onChange={(event) => setProfile((current) => ({ ...current, address: event.target.value }))}
                />
                <TextField
                  label="About / Bio"
                  multiline
                  minRows={3}
                  value={profile.bio}
                  onChange={(event) => setProfile((current) => ({ ...current, bio: event.target.value }))}
                />
                <TextField
                  label="Profile photo URL"
                  placeholder="https://..."
                  value={profile.profilePhotoUrl}
                  onChange={(event) => setProfile((current) => ({ ...current, profilePhotoUrl: event.target.value }))}
                />
                <Button variant="outlined" component="label" disabled={uploadingPhoto}>
                  {uploadingPhoto ? "Uploading..." : "Upload profile photo"}
                  <Input
                    type="file"
                    inputProps={{ accept: "image/*" }}
                    onChange={handleProfilePhotoUpload}
                    sx={{ display: "none" }}
                  />
                </Button>
                {profile.role === "carpenter" ? (
                  <>
                    <TextField
                      label="Experience years"
                      value={profile.experienceYears}
                      onChange={(event) => setProfile((current) => ({ ...current, experienceYears: event.target.value }))}
                    />
                    <TextField
                      label="Skills"
                      placeholder="Modular kitchen, polish, doors"
                      value={profile.skills}
                      onChange={(event) => setProfile((current) => ({ ...current, skills: event.target.value }))}
                    />
                    <TextField
                      label="Availability"
                      value={profile.availabilityStatus}
                      onChange={(event) => setProfile((current) => ({ ...current, availabilityStatus: event.target.value }))}
                    />
                    <TextField
                      label="Daily rate"
                      value={profile.dailyRate}
                      onChange={(event) => setProfile((current) => ({ ...current, dailyRate: event.target.value }))}
                    />
                    <TextField
                      label="Half day rate"
                      value={profile.halfDayRate}
                      onChange={(event) => setProfile((current) => ({ ...current, halfDayRate: event.target.value }))}
                    />
                    <TextField
                      label="Monthly rate"
                      value={profile.monthlyRate}
                      onChange={(event) => setProfile((current) => ({ ...current, monthlyRate: event.target.value }))}
                    />
                    <TextField
                      label="1.5 day rate"
                      value={profile.oneAndHalfDayRate}
                      onChange={(event) => setProfile((current) => ({ ...current, oneAndHalfDayRate: event.target.value }))}
                    />
                    <TextField
                      label="Overtime rate"
                      value={profile.overtimeRate}
                      onChange={(event) => setProfile((current) => ({ ...current, overtimeRate: event.target.value }))}
                    />
                    <TextField
                      label="Portfolio gallery URLs"
                      placeholder={"https://image1...\nhttps://image2...\nhttps://video-link..."}
                      multiline
                      minRows={4}
                      value={profile.portfolioUrls}
                      onChange={(event) => setProfile((current) => ({ ...current, portfolioUrls: event.target.value }))}
                    />
                    <Card variant="outlined" sx={{ borderRadius: 4 }}>
                      <CardContent sx={{ p: 2 }}>
                        <Stack spacing={2}>
                          <Typography variant="subtitle1" fontWeight={700}>
                            Photo aur portfolio preview
                          </Typography>
                          <Stack direction="row" spacing={1.5} alignItems="center">
                            <Avatar
                              src={profile.profilePhotoUrl || undefined}
                              sx={{ width: 72, height: 72, bgcolor: "primary.main" }}
                            >
                              {profile.fullName
                                ? profile.fullName.split(" ").map((item) => item[0]).slice(0, 2).join("")
                                : "KK"}
                            </Avatar>
                            <div>
                              <Typography fontWeight={700}>Profile photo</Typography>
                              <Typography variant="body2" color="text.secondary">
                                URL dalte hi yahan preview dikhega.
                              </Typography>
                            </div>
                          </Stack>
                          <Divider />
                          <Typography variant="body2" color="text.secondary">
                            Portfolio items: {portfolioItems.length}
                          </Typography>
                          {portfolioItems.length > 0 ? (
                            <Box
                              sx={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fit, minmax(92px, 1fr))",
                                gap: 1.25
                              }}
                            >
                              {portfolioItems.map((item, index) => (
                                <Card
                                  key={item.id}
                                  variant="outlined"
                                  sx={{
                                    borderRadius: 3,
                                    overflow: "hidden",
                                    minHeight: 112,
                                    bgcolor: "background.default"
                                  }}
                                >
                                  {item.mediaType === "image" ? (
                                    <Box
                                      component="img"
                                      src={item.url}
                                      alt={`Portfolio ${index + 1}`}
                                      sx={{ width: "100%", height: 84, objectFit: "cover", display: "block" }}
                                    />
                                  ) : (
                                    <Stack
                                      alignItems="center"
                                      justifyContent="center"
                                      sx={{ height: 84, px: 1.5, textAlign: "center", bgcolor: "secondary.light" }}
                                    >
                                      <Typography variant="caption" fontWeight={700}>
                                        Video link
                                      </Typography>
                                    </Stack>
                                  )}
                                  <Box sx={{ p: 1 }}>
                                    <Typography variant="caption" color="text.secondary">
                                      Item {index + 1}
                                    </Typography>
                                  </Box>
                                </Card>
                              ))}
                            </Box>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              Abhi gallery empty hai. Neeche image ya video links add karo.
                            </Typography>
                          )}
                        </Stack>
                      </CardContent>
                    </Card>
                  </>
                ) : null}
                {profile.role === "contractor" ? (
                  <TextField
                    label="Contractor type"
                    placeholder="individual or company"
                    value={profile.contractorType}
                    onChange={(event) => setProfile((current) => ({ ...current, contractorType: event.target.value }))}
                  />
                ) : null}
                {profile.role === "customer" ? (
                  <TextField
                    label="Customer type"
                    placeholder="homeowner / builder / shop_owner / office_owner"
                    value={profile.customerType}
                    onChange={(event) => setProfile((current) => ({ ...current, customerType: event.target.value }))}
                  />
                ) : null}
              </Stack>
            </CardContent>
          </Card>

          {profileAccordions.map((section) => (
            <Accordion
              key={section.title}
              disableGutters
              sx={{
                borderRadius: "12px",
                overflow: "hidden",
                "&:before": { display: "none" }
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
                <Stack spacing={0.35}>
                  <Typography fontWeight={700}>{section.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {section.summary}
                  </Typography>
                </Stack>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={1}>
                  {section.lines.map((line) => (
                    <Typography key={line} variant="body2" color="text.secondary">
                      {line}
                    </Typography>
                  ))}
                </Stack>
              </AccordionDetails>
            </Accordion>
          ))}

          <Button variant="contained" fullWidth onClick={saveProfile}>
            Save profile changes
          </Button>
          {message ? (
            <Typography variant="body2" color="text.secondary">
              {message}
            </Typography>
          ) : null}
        </Stack>
      </MobileShell>
      <Snackbar
        open={saved}
        autoHideDuration={2200}
        onClose={() => setSaved(false)}
        message="Profile changes saved"
      />
    </>
  );
}
