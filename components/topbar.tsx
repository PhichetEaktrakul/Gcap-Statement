"use client";
import ProfilePopover from "./profile-popover";
import { useEffect, useState } from "react";

export default function Topbar() {
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
    <>
      {/* MOBILE topbar — light, with brand on the left */}
      <div className="md:hidden h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 shrink-0">
        <div className="font-bold text-[#0b1a3a] text-lg tracking-wide">
          GCAP
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs whitespace-nowrap">
            {time}
          </div>
          <ProfilePopover />
        </div>
      </div>

      {/* DESKTOP topbar */}
      <div className="hidden md:flex h-16 bg-[#0b1a3a] border-b border-white/10 items-center justify-between px-6 text-white shrink-0">
        <div className="bg-green-500/10 text-green-400 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap">
          {time}
        </div>
        <div className="flex items-center gap-3">
          <ProfilePopover />
        </div>
      </div>
    </>
  );
}
