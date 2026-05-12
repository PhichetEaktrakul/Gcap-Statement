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

  // Connect to the session hub once the auth check passes.
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
    </div>
  );
}
