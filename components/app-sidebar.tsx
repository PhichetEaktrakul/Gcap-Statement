"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { PanelLeft } from "lucide-react";
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  History,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
    <div
      className={`
        bg-[#0b1a3a] text-white h-screen flex flex-col transition-all duration-300
        ${collapsed ? "w-20" : "w-64"}
      `}>
      {/* HEADER */}
      <div
        className={`
          flex items-center 
          ${collapsed ? "justify-center" : "justify-between"} 
          p-4
        `}>
        {!collapsed && (
          <div className="font-bold">
            GCAP <span className="text-sm text-gray-300">STATEMENT</span>
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg hover:bg-white/10 transition-all">
          <PanelLeft
            className={`w-5 h-5 transition-transform ${
              collapsed ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {/* MENU */}
      <div className="flex-1 space-y-2 px-2">
        {menu.map((item, i) => {
          const Icon = item.icon;
          const active = pathname === item.path;

          return (
            <Tooltip key={i}>
              <TooltipTrigger asChild>
                <div
                  onClick={() => router.push(item.path)}
                  className={`
        flex items-center ${collapsed ? "justify-center" : "gap-3"}
        px-3 py-3 rounded-lg cursor-pointer transition
        ${
          active
            ? "bg-gradient-to-r from-[#153DA3] to-[#23E8AD]"
            : "text-gray-300 hover:bg-white/10"
        }
      `}>
                  <Icon className="w-5 h-5" />
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
    </div>
  );
}
