"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  PanelLeft,
  LayoutDashboard,
  Briefcase,
  FileText,
  History,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import GcapLogo from "@/components/gcap-logo";

const menu = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { name: "Portfolio", icon: Briefcase, path: "/portfolio" },
  { name: "Leave Order", icon: FileText, path: "/leave-order" },
  { name: "History", icon: History, path: "/history" },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`
        hidden md:flex bg-[#0b1a3a] text-white h-screen flex-col transition-all duration-300
        ${collapsed ? "w-20" : "w-64"}
      `}>
      {/* HEADER */}
      <div
        className={`flex items-center p-4 ${
          collapsed ? "justify-center" : "justify-between"
        }`}>
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="bg-white rounded-lg p-1 flex items-center justify-center">
              <GcapLogo size={28} />
            </div>
            <span className="text-sm text-gray-300 font-medium">
              STATEMENT
            </span>
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg hover:bg-white/10 transition-all"
          aria-label="Toggle sidebar">
          <PanelLeft
            className={`w-5 h-5 transition-transform ${
              collapsed ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {/* MENU */}
      <div className="flex-1 space-y-2 px-2 overflow-y-auto">
        {menu.map((item, i) => {
          const Icon = item.icon;
          const active = pathname === item.path;

          return (
            <Tooltip key={i}>
              <TooltipTrigger asChild>
                <div
                  onClick={() => router.push(item.path)}
                  className={`
                    flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer transition
                    ${collapsed ? "justify-center gap-0" : ""}
                    ${
                      active
                        ? "bg-gradient-to-r from-[#153DA3] to-[#23E8AD]"
                        : "text-gray-300 hover:bg-white/10"
                    }
                  `}>
                  <Icon className="w-5 h-5 shrink-0" />
                  {!collapsed && <span>{item.name}</span>}
                </div>
              </TooltipTrigger>

              {collapsed && (
                <TooltipContent side="right">{item.name}</TooltipContent>
              )}
            </Tooltip>
          );
        })}
      </div>
    </aside>
  );
}
