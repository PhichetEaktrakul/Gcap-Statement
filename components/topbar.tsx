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
    <div className="h-16 bg-[#0b1a3a] border-b border-white/10 flex items-center justify-between px-6 text-white">
      <div className="bg-green-500/10 text-green-400 px-4 py-2 rounded-lg text-sm font-medium">
        {time}
      </div>

      <div className="flex items-center gap-3">
        <ProfilePopover />
      </div>
    </div>
  );
}
