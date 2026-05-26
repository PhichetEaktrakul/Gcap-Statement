import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import ConfigProvider from "@/components/config-provider";
import "./globals.css";

export const metadata: Metadata = {
  applicationName: "GCall — Statement viewer for call customers",
  title: {
    default: "GCall",
    template: "%s | GCall",
  },
  description:
    "Monitor your portfolio, view tickets and leave orders with real-time gold prices (For Call Customers Only).",
  keywords: [
    "GStatement",
    "GCall",
    "Gold",
    "Portfolio",
    "Call Ticket",
    "GCAP GOLD",
  ],
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  appleWebApp: {
    capable: true,
    title: "GCall",
    statusBarStyle: "default",
  },
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
  other: {
    robots: "noai, noimageai",
  },
};

export const viewport: Viewport = {
  themeColor: "#1959A3",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <ConfigProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </ConfigProvider>
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
