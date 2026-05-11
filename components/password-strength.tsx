"use client";

import { Check } from "lucide-react";

type Props = {
  score: number | null;
  errors: string[] | null;
  isValid: boolean | null;
  loading?: boolean;
  mismatch?: boolean;
};

const MAX_SCORE = 4;

export default function PasswordStrength({
  score,
  errors,
  isValid,
  loading,
  mismatch,
}: Props) {
  function segColor(idx: number): string {
    if (score === null || idx >= score) return "bg-gray-200";
    if (score <= 1) return "bg-red-500";
    if (score === 2) return "bg-yellow-500";
    if (score === 3) return "bg-blue-500";
    return "bg-green-500";
  }

  const showErrors = errors && errors.length > 0;
  const showPassed = isValid && (!errors || errors.length === 0);

  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        {Array.from({ length: MAX_SCORE }).map((_, i) => (
          <div
            key={i}
            className={`flex-1 h-1 rounded-full transition-colors ${segColor(i)}`}
          />
        ))}
      </div>

      {/* Mismatch always wins — must be resolved before password validity matters */}
      {mismatch ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <div className="font-medium">รหัสผ่านไม่ตรงกัน</div>
        </div>
      ) : loading ? (
        <div className="text-xs text-gray-400">กำลังตรวจสอบรหัสผ่าน...</div>
      ) : showErrors ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <div className="font-medium mb-1">รหัสผ่านยังไม่ปลอดภัย</div>
          <ul className="space-y-0.5 list-disc list-inside text-xs">
            {errors!.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </div>
      ) : showPassed ? (
        <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700 flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>รหัสผ่านปลอดภัย</span>
        </div>
      ) : null}
    </div>
  );
}
