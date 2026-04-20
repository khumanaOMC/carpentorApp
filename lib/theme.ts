import { createTheme } from "@mui/material/styles";

export type AppThemeMode = "light" | "dark";

export function createAppTheme(mode: AppThemeMode) {
  const isDark = mode === "dark";

  return createTheme({
    palette: {
      mode,
      primary: {
        main: isDark ? "#f3c56e" : "#8b5e3c",
        dark: isDark ? "#dba642" : "#6f4527",
        light: isDark ? "#ffd88e" : "#c89b6d",
        contrastText: isDark ? "#1b1712" : "#fffaf4"
      },
      secondary: {
        main: isDark ? "#a7f0c0" : "#d7b38a",
        dark: isDark ? "#6bd49f" : "#a27448",
        light: isDark ? "#1f2b24" : "#efe0cf",
        contrastText: isDark ? "#08120d" : "#2b221c"
      },
      background: {
        default: isDark ? "#0f0d0d" : "#f7f1e8",
        paper: isDark ? "#171312" : "#fffaf4"
      },
      text: {
        primary: isDark ? "#fff4e5" : "#2b221c",
        secondary: isDark ? "#b9ab9b" : "#6e6257"
      },
      success: {
        main: isDark ? "#74e3a3" : "#2e7d5b"
      },
      warning: {
        main: isDark ? "#f0b55b" : "#c47a2c"
      },
      error: {
        main: isDark ? "#e87e74" : "#b94a48"
      },
      divider: isDark ? "rgba(255,244,229,0.08)" : "rgba(111,69,39,0.10)"
    },
    shape: {
      borderRadius: 18
    },
    typography: {
      fontFamily: [
        "Poppins",
        "Inter",
        "Noto Sans",
        "Noto Sans Devanagari",
        "system-ui",
        "sans-serif"
      ].join(","),
      h1: { fontWeight: 700, letterSpacing: "-0.03em" },
      h2: { fontWeight: 700, letterSpacing: "-0.03em" },
      h3: { fontWeight: 700 },
      button: { textTransform: "none", fontWeight: 600 }
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: isDark ? "#0f0d0d" : "#f7f1e8",
            color: isDark ? "#fff4e5" : "#2b221c",
            transition: "background-color 220ms ease, color 220ms ease"
          }
        }
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            background: isDark ? "rgba(18, 15, 14, 0.88)" : "rgba(255, 250, 244, 0.92)",
            color: isDark ? "#fff4e5" : "#2b221c",
            backdropFilter: "blur(16px)",
            boxShadow: "none",
            borderBottom: isDark
              ? "1px solid rgba(255,244,229,0.06)"
              : "1px solid rgba(111, 69, 39, 0.08)"
          }
        }
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 24,
            backgroundImage: "none",
            boxShadow: isDark
              ? "0 18px 38px rgba(0,0,0,0.28)"
              : "0 14px 30px rgba(93, 61, 34, 0.08)",
            border: isDark ? "1px solid rgba(255,244,229,0.06)" : "1px solid rgba(111,69,39,0.04)"
          }
        }
      },
      MuiPaper: {
        styleOverrides: {
          rounded: {
            borderRadius: 24
          }
        }
      },
      MuiButton: {
        defaultProps: {
          disableElevation: true
        },
        styleOverrides: {
          root: {
            minHeight: 44,
            borderRadius: 999
          },
          containedPrimary: {
            background: isDark
              ? "linear-gradient(90deg, #f1c86b 0%, #ffb05c 100%)"
              : "linear-gradient(90deg, #8b5e3c 0%, #a87447 100%)",
            color: isDark ? "#20140c" : "#fffaf4"
          }
        }
      },
      MuiTextField: {
        defaultProps: {
          variant: "outlined",
          fullWidth: true
        }
      },
      MuiFormLabel: {
        styleOverrides: {
          root: {
            fontWeight: 500
          }
        }
      },
      MuiInputLabel: {
        styleOverrides: {
          root: {
            color: isDark ? "#b9ab9b" : "#6e6257",
            transform: "translate(14px, 15px) scale(1)",
            "&.MuiInputLabel-shrink": {
              transform: "translate(14px, -9px) scale(0.85)",
              backgroundColor: isDark ? "#171312" : "#fffaf4",
              paddingInline: 6,
              borderRadius: 6
            }
          }
        }
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            minHeight: 54,
            borderRadius: 14,
            backgroundColor: isDark ? "rgba(255,244,229,0.02)" : "#fffaf4",
            "& .MuiOutlinedInput-input": {
              padding: "15px 14px",
              fontSize: 16
            },
            "& .MuiOutlinedInput-input.MuiSelect-select": {
              minHeight: "unset"
            },
            "& fieldset": {
              borderColor: isDark ? "rgba(255,244,229,0.14)" : "rgba(111,69,39,0.18)"
            },
            "&:hover fieldset": {
              borderColor: isDark ? "rgba(243,197,110,0.52)" : "rgba(111,69,39,0.42)"
            },
            "&.Mui-focused fieldset": {
              borderWidth: 1.5,
              borderColor: isDark ? "#f3c56e" : "#8b5e3c"
            }
          },
          notchedOutline: {
            transition: "border-color 180ms ease, border-width 180ms ease"
          }
        }
      },
      MuiSelect: {
        styleOverrides: {
          select: {
            display: "flex",
            alignItems: "center"
          }
        }
      },
      MuiBottomNavigation: {
        styleOverrides: {
          root: {
            height: 72,
            background: isDark ? "rgba(18,15,14,0.94)" : "rgba(255,250,244,0.96)",
            borderTop: isDark
              ? "1px solid rgba(255,244,229,0.06)"
              : "1px solid rgba(111, 69, 39, 0.08)"
          }
        }
      },
      MuiBottomNavigationAction: {
        styleOverrides: {
          root: {
            color: isDark ? "#b9ab9b" : "#6e6257",
            "&.Mui-selected": {
              color: isDark ? "#f3c56e" : "#8b5e3c"
            }
          }
        }
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            background: isDark ? "#151111" : "#fffaf4",
            color: isDark ? "#fff4e5" : "#2b221c"
          }
        }
      },
      MuiDivider: {
        styleOverrides: {
          root: {
            borderColor: isDark ? "rgba(255,244,229,0.08)" : "rgba(111,69,39,0.08)"
          }
        }
      }
    }
  });
}
