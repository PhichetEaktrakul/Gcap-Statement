"use client";

import { useRef } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  isoDateToDdMmYyyy,
  maskDdMmYyyy,
  parseDdMmYyyy,
} from "@/lib/date";
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
        return;
      } catch {
        // fall through to focus/click fallback
      }
    }
    el.focus();
    el.click();
  }

  return (
    <div className={cn("relative", className)}>
      <Input
        type="text"
        inputMode="numeric"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(maskDdMmYyyy(e.target.value))}
        className="pr-9"
      />

      <span className="absolute inset-y-0 right-0 flex items-center pr-2 text-gray-500">
        <button
          type="button"
          onClick={openPicker}
          aria-label="Open calendar"
          className="p-1 rounded hover:text-gray-700">
          <CalendarIcon className="w-4 h-4" />
        </button>
        <input
          ref={dateRef}
          type="date"
          tabIndex={-1}
          aria-hidden="true"
          value={isoValue}
          onChange={(e) => {
            const iso = e.target.value;
            onChange(iso ? isoDateToDdMmYyyy(iso) : "");
          }}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />
      </span>
    </div>
  );
}
