"use client";
import ProfilePopover from "./profile-popover";
import { Menu } from "lucide-react";
import { useEffect, useState } from "react";

type Props = {
  onMenuClick?: () => void;
};

export default function Topbar({ onMenuClick }: Props) {
  const [time, setTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();

      // Thai locale + Buddhist year
      const formatted = now.toLocaleString("th-TH", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      setTime(formatted);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);
  return (
    <div className="h-16 bg-[#0b1a3a] border-b border-white/10 flex items-center justify-between px-3 md:px-6 text-white shrink-0">
      <div className="flex items-center gap-2 md:gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-all"
          aria-label="Open menu">
          <Menu className="w-5 h-5" />
        </button>
        <div className="bg-green-500/10 text-green-400 px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-medium whitespace-nowrap">
          {time}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <ProfilePopover />
      </div>
    </div>
  );
}
