"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  HubConnection,
  HubConnectionBuilder,
  LogLevel,
} from "@microsoft/signalr";
import { getAccessToken, setAccessToken } from "@/lib/api/client";

const HUB_URL =
  process.env.NEXT_PUBLIC_SIGNALR_HUB_URL ?? "/hubs/app";

type ForceLogoutPayload = { reason?: string };

// Opens a single SignalR connection to /hubs/app and listens for the server's
// ForceLogout event (used to kick the previous session when the user signs in
// from another device). Cleans up the connection on unmount.
export function useSessionHub() {
  const router = useRouter();

  useEffect(() => {
    if (!getAccessToken()) return;

    let connection: HubConnection | null = null;
    let cancelled = false;

    (async () => {
      const token = getAccessToken() ?? "";
      const conn = new HubConnectionBuilder()
        .withUrl(`${HUB_URL}?access_token=${encodeURIComponent(token)}`)
        .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
        .configureLogging(LogLevel.Warning)
        .build();

      conn.on("ForceLogout", (data: ForceLogoutPayload) => {
        const reason =
          data?.reason ?? "บัญชีของคุณถูกใช้งานจากอุปกรณ์อื่น";
        setAccessToken(null);
        toast.warning(reason);
        router.replace("/login");
      });

      try {
        await conn.start();
        if (cancelled) {
          conn.stop().catch(() => {});
          return;
        }
        connection = conn;
      } catch (err) {
        // Realtime is best-effort — never break the page on connection failure.
        console.warn("SignalR connection failed:", err);
      }
    })();

    return () => {
      cancelled = true;
      connection?.stop().catch(() => {});
    };
  }, [router]);
}
