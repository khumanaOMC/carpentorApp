import type { Metadata, Viewport } from "next";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { CssBaseline } from "@mui/material";
import "./globals.css";
import { AppLanguageProvider } from "@/components/providers/app-language-provider";
import { AppThemeProvider } from "@/components/providers/app-theme-provider";
import { ServiceWorkerRegister } from "@/components/providers/service-worker-register";

export const metadata: Metadata = {
  title: "KaamKaCarpenter",
  description:
    "Mobile-first PWA for carpenters, contractors and customers across India.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "KaamKaCarpenter"
  },
  icons: {
    icon: "/icons/icon-192.svg",
    apple: "/icons/icon-192.svg"
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#8b5e3c"
};

type RootLayoutProps = Readonly<{ children: React.ReactNode }>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          <AppThemeProvider>
            <AppLanguageProvider>
              <CssBaseline />
              <ServiceWorkerRegister />
              {children}
            </AppLanguageProvider>
          </AppThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
