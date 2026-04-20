"use client";

import { Box, Typography } from "@mui/material";

type KkcLogoProps = {
  variant?: "mark" | "lockup";
  size?: number;
};

export function KkcLogo({ variant = "lockup", size = 40 }: KkcLogoProps) {
  const mark = (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: size * 0.32,
        position: "relative",
        overflow: "hidden",
        bgcolor: "#8B5E3C",
        background:
          "linear-gradient(145deg, #6F4527 0%, #8B5E3C 38%, #C89B6D 100%)",
        boxShadow: "0 12px 24px rgba(111,69,39,0.22)"
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <rect x="10" y="9" width="44" height="46" rx="13" fill="#FFF8EF" />
        <path
          d="M22 22.5H31V30.5L39.5 22.5H48L37 32L48 41.5H39.5L31 34V41.5H22V22.5Z"
          fill="#8B5E3C"
        />
        <path
          d="M17 45C23.6 40.4 40.4 40.4 47 45"
          stroke="#D7B38A"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M17 18C23.8 13.6 40.2 13.6 47 18"
          stroke="#C89B6D"
          strokeOpacity="0.55"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
      </svg>
    </Box>
  );

  if (variant === "mark") {
    return mark;
  }

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
      {mark}
      <Box>
        <Typography sx={{ fontSize: 18, fontWeight: 700, lineHeight: 1 }}>
          KaamKaCarpenter
        </Typography>
        <Typography sx={{ fontSize: 11, color: "text.secondary", letterSpacing: "0.08em", textTransform: "uppercase" }}>
          Woodwork Network
        </Typography>
      </Box>
    </Box>
  );
}
