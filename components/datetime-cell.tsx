import { dateTimeParts } from "@/lib/date";

type Props = {
  iso: string;
  className?: string;
};

export default function DateTimeCell({ iso, className = "" }: Props) {
  const p = dateTimeParts(iso);
  if (!p) return <span>—</span>;
  return (
    <span className={`tabular-nums ${className}`}>
      <span className="whitespace-nowrap">{p.date}</span>
      <span className="block sm:inline sm:ml-3 text-gray-500 whitespace-nowrap">
        {p.time}
      </span>
    </span>
  );
}
