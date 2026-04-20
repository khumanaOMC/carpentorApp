import FlashOnRoundedIcon from "@mui/icons-material/FlashOnRounded";
import PlaceRoundedIcon from "@mui/icons-material/PlaceRounded";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import { Card, CardContent, Stack, Typography } from "@mui/material";
import { useAppLanguage } from "@/components/providers/app-language-provider";
import { appDictionary } from "@/lib/i18n";

export function HeroOverviewCard() {
  const { language } = useAppLanguage();
  const dictionary = appDictionary[language];

  return (
    <Card
      sx={{
        background:
          "linear-gradient(145deg, rgba(139,94,60,1), rgba(200,155,109,0.92))",
        color: "#fffaf4"
      }}
    >
      <CardContent sx={{ p: 2.25 }}>
        <Stack spacing={2}>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Stack
              direction="row"
              spacing={0.75}
              alignItems="center"
              sx={{
                px: 1.2,
                py: 0.7,
                borderRadius: 999,
                bgcolor: "rgba(255,250,244,0.16)"
              }}
            >
              <VerifiedRoundedIcon sx={{ fontSize: 18 }} />
              <Typography variant="caption" fontWeight={600}>
                {dictionary.hero.verifiedProfiles}
              </Typography>
            </Stack>
            <Stack
              direction="row"
              spacing={0.75}
              alignItems="center"
              sx={{
                px: 1.2,
                py: 0.7,
                borderRadius: 999,
                bgcolor: "rgba(255,250,244,0.16)"
              }}
            >
              <PlaceRoundedIcon sx={{ fontSize: 18 }} />
              <Typography variant="caption" fontWeight={600}>
                {dictionary.hero.cityFilters}
              </Typography>
            </Stack>
          </Stack>
          <div>
            <Typography variant="h5" sx={{ mb: 0.75 }}>
              {dictionary.hero.title}
            </Typography>
            <Typography variant="body2" sx={{ color: "rgba(255,250,244,0.84)" }}>
              {dictionary.hero.subtitle}
            </Typography>
          </div>
          <Stack
            direction="row"
            spacing={0.75}
            alignItems="center"
            sx={{
              alignSelf: "flex-start",
              px: 1.2,
              py: 0.7,
              borderRadius: 999,
              bgcolor: "rgba(255,250,244,0.18)"
            }}
          >
            <FlashOnRoundedIcon sx={{ fontSize: 18 }} />
            <Typography variant="caption" fontWeight={600}>
              {dictionary.hero.installable}
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
