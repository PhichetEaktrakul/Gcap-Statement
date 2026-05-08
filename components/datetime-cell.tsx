import { dateTimeParts } from "@/lib/date";

type Props = {
  iso: string;
  className?: string;
};

export default function DateTimeCell({ iso, className = "" }: Props) {
  const p = dateTimeParts(iso);
  if (!p) return <span>—</span>;
  return (
    <span className={`whitespace-nowrap tabular-nums ${className}`}>
      {p.date}
      <span className="ml-3 text-gray-500">{p.time}</span>
    </span>
  );
}
