"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  History,
} from "lucide-react";

const items = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { name: "Portfolio", icon: Briefcase, path: "/portfolio" },
  { name: "Leave Order", icon: FileText, path: "/leave-order" },
  { name: "History", icon: History, path: "/history" },
];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#0b1a3a] border-t border-white/10 text-white pb-[env(safe-area-inset-bottom)]"
      style={{ boxShadow: "0 -2px 12px rgba(0,0,0,0.25)" }}
      aria-label="Primary">
      <div className="grid grid-cols-4">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`relative flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-medium transition-colors ${
                active ? "text-white" : "text-gray-400 hover:text-gray-200"
              }`}
              aria-current={active ? "page" : undefined}>
              {active && (
                <span className="absolute top-0 inset-x-5 h-0.5 rounded-full bg-linear-to-r from-[#c7ae86] to-[#ffdfab]" />
              )}
              <Icon className="w-5 h-5" />
              <span>{item.name}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
