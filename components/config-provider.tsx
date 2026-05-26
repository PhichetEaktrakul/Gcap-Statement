"use client";

import { useEffect, useState } from "react";
import { loadRuntimeConfig } from "@/lib/config";

export default function ConfigProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    loadRuntimeConfig()
      .then(() => active && setStatus("ready"))
      .catch(() => active && setStatus("error"));
    return () => {
      active = false;
    };
  }, [attempt]);

  if (status === "error") {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-[#f5f7fb] px-6 text-center">
        <p className="text-sm text-gray-600">ไม่สามารถโหลดการตั้งค่าระบบได้ กรุณาลองใหม่อีกครั้ง</p>
        <button
          onClick={() => {
            setStatus("loading");
            setAttempt((n) => n + 1);
          }}
          className="rounded-md bg-[#1959A3] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          ลองใหม่
        </button>
      </div>
    );
  }

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f5f7fb]">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-[#1959A3]" />
      </div>
    );
  }

  return <>{children}</>;
}
