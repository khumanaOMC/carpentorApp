import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import { Card, CardContent, Stack, Typography } from "@mui/material";
import { Pill } from "@/components/ui/pill";

type AttendanceCardProps = {
  worker: string;
  shift: string;
  note: string;
  approved: boolean;
};

export function AttendanceCard({ worker, shift, note, approved }: AttendanceCardProps) {
  return (
    <Card>
      <CardContent sx={{ p: 2 }}>
        <Stack spacing={1}>
          <Stack direction="row" justifyContent="space-between" gap={1}>
            <div>
              <Typography variant="subtitle1" fontWeight={700}>
                {worker}
              </Typography>
              <Stack direction="row" spacing={0.5} alignItems="center">
                <AccessTimeRoundedIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                <Typography variant="body2" color="text.secondary">
                  {shift}
                </Typography>
              </Stack>
            </div>
            <Stack direction="row" spacing={0.6} alignItems="center">
              {approved ? <VerifiedRoundedIcon sx={{ fontSize: 18, color: "success.main" }} /> : null}
              <Pill label={approved ? "Approved" : "Pending"} tone={approved ? "success" : "warning"} />
            </Stack>
          </Stack>
          <Typography variant="body2" color="text.secondary">
            {note}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}
