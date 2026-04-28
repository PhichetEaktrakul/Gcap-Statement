"use client";

import AppSidebar from "@/components/app-sidebar";
import Topbar from "@/components/topbar";
import BottomNav from "@/components/bottom-nav";

export default function Layout({ children }: { children: React.ReactNode }) {
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
