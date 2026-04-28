"use client";

import { useState } from "react";
import AppSidebar from "@/components/app-sidebar";
import Topbar from "@/components/topbar";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#f5f7fb]">
      <AppSidebar
        mobileOpen={mobileOpen}
        onMobileOpenChange={setMobileOpen}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar onMenuClick={() => setMobileOpen(true)} />
        <div className="flex-1 overflow-auto">{children}</div>
      </div>
    </div>
  );
}
