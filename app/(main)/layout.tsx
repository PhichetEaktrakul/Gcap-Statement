"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppSidebar from "@/components/app-sidebar";
import Topbar from "@/components/topbar";
import BottomNav from "@/components/bottom-nav";
import { getAccessToken } from "@/lib/api/client";
import { useSessionHub } from "@/lib/realtime/use-session-hub";

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    if (!getAccessToken()) {
      router.replace("/login");
    } else {
      setAuthed(true);
    }
  }, [router]);

  useSessionHub();

  if (!authed) return null;

  return (
    <div className="flex h-screen bg-[#f5f7fb]">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <div className="flex-1 overflow-auto pb-20 md:pb-0">{children}</div>
      </div>
      <BottomNav />

      <span className="hidden md:block fixed bottom-2 right-3 text-xs text-gray-200 pointer-events-none select-none z-10">
        © {new Date().getFullYear()} GCAP GOLD -- STATEMENT v1.0.7
      </span>
    </div>
  );
}
