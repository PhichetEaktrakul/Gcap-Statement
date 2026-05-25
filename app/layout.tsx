import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getRuntimeConfig } from "@/lib/config";
import "./globals.css";

// Rendered at request time so the injected config reflects the container's env
// (docker-compose `environment:`), not the values present during `next build`.
export const dynamic = "force-dynamic";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {/* Runs before the app bundle so window.__APP_CONFIG__ is set before any
            client code reads the backend URLs. `<` is escaped so a value can't
            break out of the tag. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `window.__APP_CONFIG__=${JSON.stringify(getRuntimeConfig()).replace(/</g, "\\u003c")};`,
          }}
        />
        <TooltipProvider>{children}</TooltipProvider>
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
