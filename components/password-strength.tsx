"use client";

const PASSWORD_CHECKS: { label: string; test: (p: string) => boolean }[] = [
  { label: "อย่างน้อย 8 ตัวอักษร", test: (p) => p.length >= 8 },
  { label: "มีตัวอักษรพิมพ์ใหญ่ (A–Z)", test: (p) => /[A-Z]/.test(p) },
  { label: "มีตัวอักษรพิมพ์เล็ก (a–z)", test: (p) => /[a-z]/.test(p) },
  { label: "มีตัวเลข (0–9)", test: (p) => /[0-9]/.test(p) },
  {
    label: "มีอักขระพิเศษ (เช่น ! @ # $)",
    test: (p) => /[^A-Za-z0-9]/.test(p),
  },
];

export function isPasswordStrong(p: string): boolean {
  return PASSWORD_CHECKS.every((c) => c.test(p));
}

export default function PasswordStrength({ password }: { password: string }) {
  const checks = PASSWORD_CHECKS.map((c) => ({
    label: c.label,
    ok: c.test(password),
  }));
  const score = checks.filter((c) => c.ok).length;
  const total = checks.length;

  function segColor(idx: number): string {
    if (idx >= score) return "bg-gray-200";
    if (score <= 2) return "bg-red-500";
    if (score <= 3) return "bg-yellow-500";
    if (score <= 4) return "bg-blue-500";
    return "bg-green-500";
  }

  return (
    <div className="space-y-1.5">
      <div className="flex gap-1">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={`flex-1 h-1 rounded-full transition-colors ${segColor(i)}`}
          />
        ))}
      </div>
      <ul className="text-xs space-y-0.5">
        {checks.map((c, i) => (
          <li key={i} className={c.ok ? "text-green-600" : "text-gray-500"}>
            <span className="inline-block w-3">{c.ok ? "✓" : "•"}</span>{" "}
            {c.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
