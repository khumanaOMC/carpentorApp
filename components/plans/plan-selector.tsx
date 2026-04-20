"use client";

import { useEffect, useRef } from "react";
import DoneRoundedIcon from "@mui/icons-material/DoneRounded";
import {
  Box,
  ButtonBase,
  Stack,
  Typography
} from "@mui/material";
import { planCatalog, rolePlanCopy, type SubscriptionPlan, type UserRolePlan } from "@/lib/plan-data";

type PlanSelectorProps = {
  role: "carpenter" | "contractor" | "customer";
  selectedPlan: SubscriptionPlan;
  onPlanChange: (value: SubscriptionPlan) => void;
};

const planVisuals = {
  basic: {
    titleColor: "#8f8794",
    accent: "#9c93a4",
    border: "rgba(131, 123, 143, 0.30)",
    glow: "rgba(156, 147, 164, 0.16)",
    buttonBg: "linear-gradient(180deg, rgba(55,48,61,0.92), rgba(39,34,45,0.98))",
    buttonText: "rgba(236,229,241,0.52)",
    buttonBorder: "rgba(154, 143, 166, 0.14)"
  },
  standard: {
    titleColor: "#f1bf62",
    accent: "#ffb45e",
    border: "rgba(244, 188, 91, 0.92)",
    glow: "rgba(255, 182, 77, 0.34)",
    buttonBg: "linear-gradient(90deg, #f6d97d 0%, #ffae5e 100%)",
    buttonText: "#23170f",
    buttonBorder: "transparent"
  },
  pro: {
    titleColor: "#88ecaf",
    accent: "#9df5bc",
    border: "rgba(125, 221, 168, 0.26)",
    glow: "rgba(125, 221, 168, 0.22)",
    buttonBg: "linear-gradient(90deg, #74efc0 0%, #ffe16a 100%)",
    buttonText: "#132017",
    buttonBorder: "transparent"
  }
} as const;

function getPlanDescription(role: UserRolePlan, planId: SubscriptionPlan) {
  if (role === "carpenter") {
    if (planId === "basic") return "Unlock offers free plan for personal use";
    if (planId === "standard") return "For most karigars who want to optimize reach and income";
    return "Unlock the most powerful growth plan for all India work";
  }

  if (role === "contractor") {
    if (planId === "basic") return "Start with limited hiring and shortlist access";
    if (planId === "standard") return "For most thekedars who want to scale hiring and approval";
    return "Full control plan for workforce, teams and settlement";
  }

  if (planId === "basic") return "Search and connect with trusted carpenters for free";
  if (planId === "standard") return "Best plan for faster booking and quotation response";
  return "Priority plan for premium support and faster assistance";
}

function getPlanButtonText(planId: SubscriptionPlan, active: boolean) {
  if (active) {
    return planId === "basic" ? "Selected plan" : `Upgrade to ${planId === "standard" ? "Standard" : "Pro"}`;
  }

  return planId === "basic" ? "Choose Basic" : planId === "standard" ? "Choose Standard" : "Choose Pro";
}

function getPriceParts(price: string) {
  const [amount, cycle] = price.split(" / ");
  return {
    amount,
    cycle: cycle || "month"
  };
}

export function PlanSelector({ role, selectedPlan, onPlanChange }: PlanSelectorProps) {
  const normalizedRole: UserRolePlan =
    role === "contractor" ? "contractor" : role === "customer" ? "customer" : "carpenter";
  const copy = rolePlanCopy[normalizedRole];
  const plans = planCatalog[normalizedRole];
  const itemRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    const element = itemRefs.current[selectedPlan];
    if (!element) return;

    element.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest"
    });
  }, [selectedPlan]);

  return (
    <Stack spacing={1.2}>
      <Box>
        <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 0.35 }}>
          {copy.title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {copy.subtitle}
        </Typography>
      </Box>

      <Box
        sx={{
          display: "flex",
          gap: 1.4,
          overflowX: "auto",
          px: "14%",
          py: 1.2,
          mx: "-11%",
          scrollPaddingInline: "14%",
          scrollSnapType: "x mandatory",
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": {
            display: "none"
          }
        }}
      >
        {plans.map((plan) => {
          const active = selectedPlan === plan.id;
          const visuals = planVisuals[plan.id];
          const { amount, cycle } = getPriceParts(plan.price);

          return (
            <ButtonBase
              key={plan.id}
              ref={(node) => {
                itemRefs.current[plan.id] = node;
              }}
                onClick={() => onPlanChange(plan.id)}
                sx={{
                  textAlign: "left",
                  minWidth: "72%",
                  maxWidth: "72%",
                  flex: "0 0 72%",
                  borderRadius: "20px",
                  overflow: "visible",
                  scrollSnapAlign: "center",
                  transform: active ? "translateY(0) scale(1)" : "translateY(10px) scale(0.94)",
                  opacity: active ? 1 : 0.88,
                  transition: "transform 240ms ease, opacity 240ms ease"
                }}
              >
                <Box
                  sx={{
                    width: "100%",
                    minHeight: 0,
                    p: 1.55,
                    pb: 0.55,
                    borderRadius: "20px",
                    position: "relative",
                    overflow: "hidden",
                    background: "linear-gradient(180deg, #101014 0%, #111015 100%)",
                    border: "1px solid",
                    borderColor: visuals.border,
                    boxShadow: active
                      ? `0 0 0 1px ${visuals.border}, 0 0 42px ${visuals.glow || "rgba(0,0,0,0)"}, 0 22px 42px rgba(6,6,8,0.30)`
                      : "0 10px 24px rgba(6,6,8,0.18)"
                  }}
                >
                {active ? (
                  <Box
                    sx={{
                      position: "absolute",
                      inset: -18,
                      zIndex: -1,
                      borderRadius: 7,
                      background: `radial-gradient(circle at 50% 50%, ${visuals.glow || "rgba(0,0,0,0)"}, transparent 68%)`,
                      filter: "blur(16px)"
                    }}
                  />
                ) : null}

                  <Stack sx={{ height: "100%" }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 0.9 }}>
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: "50%",
                        display: "grid",
                        placeItems: "center",
                        border: "1px solid rgba(255,255,255,0.14)",
                        bgcolor: "rgba(255,255,255,0.02)",
                        boxShadow: active ? `0 0 24px ${visuals.glow || "rgba(0,0,0,0)"}` : "none"
                      }}
                    >
                      <Box
                        sx={{
                          width: 14,
                          height: 14,
                          borderRadius: "50%",
                          border: `2px solid ${visuals.accent}`,
                          boxShadow: active ? `0 0 18px ${visuals.accent}` : "none"
                        }}
                      />
                    </Box>

                    {plan.badge ? (
                      <Box
                        sx={{
                          px: 1,
                          py: 0.45,
                          borderRadius: 999,
                          border: "1px solid rgba(255,255,255,0.12)",
                          bgcolor: "rgba(255,255,255,0.03)"
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            color: visuals.accent,
                            textTransform: "uppercase",
                            letterSpacing: "0.08em",
                            fontWeight: 700
                          }}
                        >
                          {plan.badge}
                        </Typography>
                      </Box>
                    ) : null}
                  </Stack>

                  <Typography
                    sx={{
                      color: visuals.titleColor,
                      fontSize: 16,
                      fontWeight: 500,
                      lineHeight: 1.1
                    }}
                  >
                    {plan.name}
                  </Typography>

                  <Stack direction="row" spacing={0.6} alignItems="flex-end" sx={{ mt: 0.55 }}>
                    <Typography
                      sx={{
                        fontSize: 38,
                        lineHeight: 0.88,
                        fontWeight: 800,
                        letterSpacing: "-0.06em",
                        color: "#fffaf2"
                      }}
                    >
                      {amount}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        pb: 0.35,
                        color: "rgba(255,250,242,0.42)",
                        fontSize: 11
                      }}
                    >
                      /{cycle}
                    </Typography>
                  </Stack>

                  <Typography
                    variant="body2"
                    sx={{
                      mt: 0.45,
                      mb: 0.7,
                      color: "rgba(255,250,242,0.42)",
                      lineHeight: 1.5,
                      maxWidth: 280,
                      fontSize: 11
                    }}
                  >
                    {getPlanDescription(normalizedRole, plan.id)}
                  </Typography>

                  <Stack spacing={0.56}>
                    {plan.features.slice(0, 3).map((feature) => (
                      <Stack key={feature} direction="row" spacing={1.1} alignItems="center">
                        <Box
                          sx={{
                            width: 16,
                            height: 16,
                            borderRadius: "50%",
                            display: "grid",
                            placeItems: "center",
                            border: `1px solid ${visuals.accent}`,
                            boxShadow: active ? `0 0 12px ${visuals.glow || "rgba(0,0,0,0)"}` : "none"
                          }}
                        >
                          <DoneRoundedIcon sx={{ fontSize: 10, color: visuals.accent }} />
                        </Box>
                        <Typography
                          variant="body2"
                          sx={{
                            color: "rgba(255,250,242,0.9)",
                            fontSize: 10.5,
                            lineHeight: 1.45
                          }}
                        >
                          {feature}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>

                  <Box
                    sx={{
                      mt: 0.7,
                      py: 0.8,
                      borderRadius: 2.2,
                      textAlign: "center",
                      fontWeight: 700,
                      fontSize: 10.8,
                      background: visuals.buttonBg,
                      color: visuals.buttonText,
                      border: `1px solid ${visuals.buttonBorder}`,
                      boxShadow: active ? `0 10px 22px ${visuals.glow || "rgba(0,0,0,0)"}` : "none"
                    }}
                  >
                    {getPlanButtonText(plan.id, active)}
                  </Box>
                </Stack>
              </Box>
            </ButtonBase>
          );
        })}
      </Box>

      <Stack direction="row" spacing={0.8} justifyContent="center">
        {plans.map((plan) => {
          const active = selectedPlan === plan.id;

          return (
            <Box
              key={plan.id}
              sx={{
                width: active ? 22 : 8,
                height: 8,
                borderRadius: 999,
                bgcolor: active ? "#f1bf62" : "rgba(111,69,39,0.18)",
                transition: "width 180ms ease, background-color 180ms ease"
              }}
            />
          );
        })}
      </Stack>
    </Stack>
  );
}
