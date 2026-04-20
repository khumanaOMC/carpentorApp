import { Box, Typography } from "@mui/material";

type PillProps = {
  label: string;
  tone?: "filled" | "outlined" | "soft" | "success" | "warning";
};

export function Pill({ label, tone = "soft" }: PillProps) {
  const styles = {
    filled: {
      bgcolor: "primary.main",
      color: "primary.contrastText",
      border: "1px solid transparent"
    },
    outlined: {
      bgcolor: "transparent",
      color: "text.primary",
      border: "1px solid rgba(111,69,39,0.22)"
    },
    soft: {
      bgcolor: "secondary.light",
      color: "text.primary",
      border: "1px solid transparent"
    },
    success: {
      bgcolor: "rgba(46,125,91,0.12)",
      color: "success.main",
      border: "1px solid rgba(46,125,91,0.16)"
    },
    warning: {
      bgcolor: "rgba(196,122,44,0.12)",
      color: "warning.main",
      border: "1px solid rgba(196,122,44,0.16)"
    }
  }[tone];

  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 30,
        px: 1.4,
        py: 0.6,
        borderRadius: 999,
        ...styles
      }}
    >
      <Typography variant="caption" fontWeight={600}>
        {label}
      </Typography>
    </Box>
  );
}
