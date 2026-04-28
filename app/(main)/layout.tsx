"use client";

import AppSidebar from "@/components/app-sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-[#f5f7fb]">
      <AppSidebar />
      <div className="flex-1 flex flex-col">{children}</div>
    </div>
  );
}
