"use client";

import { useRef } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { isoDateToDdMmYyyy, maskDdMmYyyy, parseDdMmYyyy } from "@/lib/date";
import { cn } from "@/lib/utils";

type Props = {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  className?: string;
};

export default function DateField({
  value,
  onChange,
  placeholder = "dd/mm/yyyy",
  className,
}: Props) {
  const dateRef = useRef<HTMLInputElement>(null);
  const isoValue = parseDdMmYyyy(value) ?? "";

  function openPicker() {
    const el = dateRef.current;
    if (!el) return;
    if (typeof el.showPicker === "function") {
      try {
        el.showPicker();
      } catch {
      }
    }
  }

  return (
    <div className={cn("relative", className)}>
      <Input
        type="text"
        inputMode="numeric"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(maskDdMmYyyy(e.target.value))}
        className="pr-10"
      />

      <span className="pointer-events-none absolute inset-y-0 right-0 flex w-10 items-center justify-center text-gray-500">
        <CalendarIcon className="w-4 h-4" />
      </span>

      <input
        ref={dateRef}
        type="date"
        value={isoValue}
        onChange={(e) => {
          const iso = e.target.value;
          onChange(iso ? isoDateToDdMmYyyy(iso) : "");
        }}
        onClick={openPicker}
        aria-label="Open calendar"
        className="absolute right-0 top-0 h-full w-10 cursor-pointer opacity-0"
      />
    </div>
  );
}
