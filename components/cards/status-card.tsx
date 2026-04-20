import { Card, CardContent, Stack, Typography } from "@mui/material";

type StatusCardProps = {
  label: string;
  value: string;
};

export function StatusCard({ label, value }: StatusCardProps) {
  return (
    <Card>
      <CardContent sx={{ p: 2 }}>
        <Stack spacing={0.6}>
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
          <Typography variant="h5">{value}</Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}
