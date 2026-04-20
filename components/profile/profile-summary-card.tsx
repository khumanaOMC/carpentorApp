import VerifiedUserRoundedIcon from "@mui/icons-material/VerifiedUserRounded";
import WalletRoundedIcon from "@mui/icons-material/WalletRounded";
import WorkHistoryRoundedIcon from "@mui/icons-material/WorkHistoryRounded";
import {
  Avatar,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Rating,
  Stack,
  Typography
} from "@mui/material";
import { Pill } from "@/components/ui/pill";

type ProfileSummaryCardProps = {
  initials?: string;
  name?: string;
  subtitle?: string;
  rating?: number;
  kycVerified?: boolean;
  availableLabel?: string;
  earningsLabel?: string;
  workLabel?: string;
  photoUrl?: string;
};

export function ProfileSummaryCard({
  initials = "RK",
  name = "Rakesh Suthar",
  subtitle = "Jaipur • Modular kitchen • Outstation ready",
  rating = 4.5,
  kycVerified = true,
  availableLabel = "Available today",
  earningsLabel = "₹42,500 this month",
  workLabel = "28 jobs • 96% acceptance",
  photoUrl = ""
}: ProfileSummaryCardProps) {
  return (
    <Card>
      <CardContent sx={{ p: 2 }}>
        <Stack spacing={2}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar src={photoUrl || undefined} sx={{ width: 56, height: 56, bgcolor: "primary.main" }}>{initials}</Avatar>
            <div>
              <Typography variant="subtitle1" fontWeight={700}>
                {name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
              <Rating value={rating} precision={0.5} readOnly size="small" />
            </div>
          </Stack>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Stack direction="row" spacing={0.75} alignItems="center">
              <VerifiedUserRoundedIcon sx={{ fontSize: 18, color: "success.main" }} />
              <Pill label={kycVerified ? "KYC verified" : "KYC pending"} tone={kycVerified ? "success" : "warning"} />
            </Stack>
            <Pill label={availableLabel} />
          </Stack>
          <List disablePadding>
            <ListItem disableGutters>
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: "secondary.light", color: "text.primary" }}>
                  <WalletRoundedIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText primary="Earnings summary" secondary={earningsLabel} />
            </ListItem>
            <ListItem disableGutters>
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: "secondary.light", color: "text.primary" }}>
                  <WorkHistoryRoundedIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText primary="Completed work" secondary={workLabel} />
            </ListItem>
          </List>
        </Stack>
      </CardContent>
    </Card>
  );
}
