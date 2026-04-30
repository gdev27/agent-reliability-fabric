import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { Telemetry } from "../components/telemetry";
import { ThemeProvider } from "../components/theme-provider";
import { Toaster } from "../components/ui/toaster";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL || "http://localhost:3000"),
  title: {
    default: "gctl — policy-constrained autonomy",
    template: "%s | gctl"
  },
  description:
    "gctl is a policy-constrained control plane for autonomous onchain operations. Run, prove, and review every decision against signed policy.",
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title: "gctl — policy-constrained autonomy you can prove",
    description:
      "gctl is a policy-constrained control plane for autonomous onchain operations. Run, prove, and review every decision against signed policy.",
    siteName: "gctl",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "gctl — policy-constrained autonomy you can prove",
    description:
      "Policy-constrained control plane for autonomous onchain operations. Run, prove, and review every decision."
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f8fb" },
    { media: "(prefers-color-scheme: dark)", color: "#0c111d" }
  ]
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`} suppressHydrationWarning>
      <head>
        {/* Synchronous theme bootstrap is intentional: prevents flash of incorrect color theme. */}
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script src="/theme-init.js" />
      </head>
      <body className="min-h-screen bg-bg text-text antialiased">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <ThemeProvider>
          <Telemetry />
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
