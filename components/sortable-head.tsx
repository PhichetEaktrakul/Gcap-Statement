"use client";

import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";
import { TableHead } from "@/components/ui/table";

export type SortDir = "asc" | "desc";

export type SortState = {
  key: string | null;
  dir: SortDir;
};

export const NO_SORT: SortState = { key: null, dir: "asc" };

export function nextSortState(prev: SortState, key: string): SortState {
  if (prev.key === key) {
    return { key, dir: prev.dir === "asc" ? "desc" : "asc" };
  }
  return { key, dir: "asc" };
}

type SortableValue = string | number | null | undefined;

export function sortItems<T>(
  items: T[],
  state: SortState,
  getter: (item: T, key: string) => SortableValue
): T[] {
  if (!state.key) return items;
  const mult = state.dir === "asc" ? 1 : -1;
  return [...items].sort((a, b) => {
    const va = getter(a, state.key!);
    const vb = getter(b, state.key!);
    if (va === vb) return 0;
    if (va === null || va === undefined) return -1 * mult;
    if (vb === null || vb === undefined) return 1 * mult;
    if (typeof va === "number" && typeof vb === "number") {
      return (va - vb) * mult;
    }
    return String(va).localeCompare(String(vb)) * mult;
  });
}

type Props = {
  children: React.ReactNode;
  columnKey: string;
  state: SortState;
  onSort: (key: string) => void;
  className?: string;
  align?: "left" | "center" | "right";
};

export function SortableHead({
  children,
  columnKey,
  state,
  onSort,
  className = "",
  align = "left",
}: Props) {
  const active = state.key === columnKey;
  const Icon = !active
    ? ChevronsUpDown
    : state.dir === "asc"
      ? ChevronUp
      : ChevronDown;

  const justify =
    align === "right"
      ? "justify-end"
      : align === "center"
        ? "justify-center"
        : "justify-start";

  return (
    <TableHead className={className}>
      <button
        type="button"
        onClick={() => onSort(columnKey)}
        className={`w-full inline-flex items-center gap-1 ${justify} hover:text-gray-900`}>
        <span>{children}</span>
        <Icon
          className={`w-3.5 h-3.5 shrink-0 ${active ? "opacity-100" : "opacity-40"}`}
        />
      </button>
    </TableHead>
  );
}
