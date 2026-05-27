// Progressively formats raw user input into a dd/mm/yyyy mask as digits are typed.
export function maskDdMmYyyy(input: string): string {
  const digits = input.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

// Parses a dd/mm/yyyy string into an ISO yyyy-mm-dd date.
export function parseDdMmYyyy(s: string): string | null {
  const m = s.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return null;
  const [, dd, mm, yyyy] = m;
  const day = Number(dd);
  const month = Number(mm);
  const year = Number(yyyy);
  if (month < 1 || month > 12) return null;
  if (day < 1 || day > 31) return null;
  if (year < 1900 || year > 2999) return null;
  return `${yyyy}-${mm}-${dd}`;
}

export type DateTimeParts = { date: string; time: string };

// Returns the dd/mm/yy (Buddhist 2-digit year) and HH:mm parts for a row cell.
export function dateTimeParts(iso: string): DateTimeParts | null {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const yy = String((d.getFullYear() + 543) % 100).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return { date: `${dd}/${mm}/${yy}`, time: `${hh}:${mi}` };
}

// dd/mm/yyyy (4-digit CE year) — what the dd/mm/yyyy filter inputs expect.
export function dateToDdMmYyyy(d: Date): string {
  const yyyy = String(d.getFullYear()).padStart(4, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${dd}/${mm}/${yyyy}`;
}

// Converts an ISO yyyy-mm-dd[...] string to dd/mm/yyyy; returns "" if the prefix doesn't match.
export function isoDateToDdMmYyyy(iso: string): string {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return "";
  return `${m[3]}/${m[2]}/${m[1]}`;
}
