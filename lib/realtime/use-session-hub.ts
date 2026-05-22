"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  HubConnection,
  HubConnectionBuilder,
  LogLevel,
} from "@microsoft/signalr";
import {
  getAccessToken,
  refreshAccessToken,
  setAccessToken,
} from "@/lib/api/client";
import { SIGNALR_HUB_URL } from "@/lib/config";

type ForceLogoutPayload = { reason?: string };

function isAuthError(err: unknown): boolean {
  if (!err) return false;
  const e = err as { statusCode?: number; message?: string };
  if (e.statusCode === 401) return true;
  return /\b401\b|unauthorized/i.test(e.message ?? "");
}

// Opens a single SignalR connection to {SIGNALR_HUB_URL} and listens for the server's
// ForceLogout event (used to kick the previous session when the user signs in
// from another device). On a 401 during start/reconnect, attempts a single
// token refresh; if that fails the user is forced back to /login.
export function useSessionHub() {
  const router = useRouter();

  useEffect(() => {
    if (!getAccessToken()) return;

    let connection: HubConnection | null = null;
    let cancelled = false;
    let refreshAttempted = false;

    function forceLogout(reason: string) {
      setAccessToken(null);
      toast.warning(reason);
      router.replace("/login");
    }

    async function tryRefreshAndReconnect(): Promise<HubConnection | null> {
      if (cancelled) return null;
      if (refreshAttempted) {
        forceLogout("เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่");
        return null;
      }
      refreshAttempted = true;
      try {
        await refreshAccessToken();
      } catch {
        forceLogout("เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่");
        return null;
      }
      if (cancelled) return null;
      return await buildAndStart();
    }

    async function buildAndStart(): Promise<HubConnection | null> {
      const conn = new HubConnectionBuilder()
        .withUrl(SIGNALR_HUB_URL, {
          accessTokenFactory: () => getAccessToken() ?? "",
        })
        .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
        .configureLogging(LogLevel.Warning)
        .build();

      conn.on("ForceLogout", (data: ForceLogoutPayload) => {
        forceLogout(data?.reason ?? "บัญชีของคุณถูกใช้งานจากอุปกรณ์อื่น");
      });

      conn.onclose(async (err) => {
        if (cancelled) return;
        if (!isAuthError(err)) return;
        const newConn = await tryRefreshAndReconnect();
        if (!cancelled && newConn) connection = newConn;
      });

      try {
        await conn.start();
        if (cancelled) {
          conn.stop().catch(() => {});
          return null;
        }
        return conn;
      } catch (err) {
        if (isAuthError(err)) {
          return await tryRefreshAndReconnect();
        }
        console.warn("SignalR connection failed:", err);
        return null;
      }
    }

    (async () => {
      connection = await buildAndStart();
    })();

    return () => {
      cancelled = true;
      connection?.stop().catch(() => {});
    };
  }, [router]);
}
