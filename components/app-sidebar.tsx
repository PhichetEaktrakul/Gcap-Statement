"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  PanelLeft,
  X,
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

const menu = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { name: "Portfolio", icon: Briefcase, path: "/portfolio" },
  { name: "Leave Order", icon: FileText, path: "/leave-order" },
  { name: "History", icon: History, path: "/history" },
];

type Props = {
  mobileOpen?: boolean;
  onMobileOpenChange?: (open: boolean) => void;
};

export default function AppSidebar({
  mobileOpen = false,
  onMobileOpenChange,
}: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  const closeMobile = () => onMobileOpenChange?.(false);

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          onClick={closeMobile}
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          bg-[#0b1a3a] text-white h-screen flex flex-col transition-all duration-300
          fixed md:relative inset-y-0 left-0 z-50
          w-64 ${collapsed ? "md:w-20" : "md:w-64"}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}>
        {/* HEADER */}
        <div
          className={`
            flex items-center justify-between p-4
            ${collapsed ? "md:justify-center" : ""}
          `}>
          <div className={`font-bold ${collapsed ? "md:hidden" : ""}`}>
            GCAP <span className="text-sm text-gray-300">STATEMENT</span>
          </div>

          {/* Mobile close button */}
          <button
            onClick={closeMobile}
            className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-all"
            aria-label="Close menu">
            <X className="w-5 h-5" />
          </button>

          {/* Desktop collapse button */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:block p-2 rounded-lg hover:bg-white/10 transition-all"
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
                    onClick={() => {
                      router.push(item.path);
                      closeMobile();
                    }}
                    className={`
                      flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer transition
                      ${collapsed ? "md:justify-center md:gap-0" : ""}
                      ${
                        active
                          ? "bg-gradient-to-r from-[#153DA3] to-[#23E8AD]"
                          : "text-gray-300 hover:bg-white/10"
                      }
                    `}>
                    <Icon className="w-5 h-5 shrink-0" />
                    <span className={collapsed ? "md:hidden" : ""}>
                      {item.name}
                    </span>
                  </div>
                </TooltipTrigger>

                {collapsed && (
                  <TooltipContent side="right" className="hidden md:block">
                    {item.name}
                  </TooltipContent>
                )}
              </Tooltip>
            );
          })}
        </div>
      </aside>
    </>
  );
}
