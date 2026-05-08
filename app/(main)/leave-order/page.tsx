"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  tradeService,
  type LeaveOrderItem,
} from "@/lib/api/services/trade.service";
import { dateToDdMmYyyy, parseDdMmYyyy } from "@/lib/date";
import DateField from "@/components/date-field";
import DateTimeCell from "@/components/datetime-cell";

const PAGE_SIZE = 10;

type Filters = {
  asset: string;
  command: string;
  status: string;
  dateFrom: string;
  dateTo: string;
};

function buildInitialFilters(): Filters {
  const today = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(today.getDate() - 7);
  return {
    asset: "all",
    command: "all",
    status: "all",
    dateFrom: dateToDdMmYyyy(sevenDaysAgo),
    dateTo: dateToDdMmYyyy(today),
  };
}

function fmtDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const yyyy = String((d.getFullYear() + 543) % 100).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${dd}/${mm}/${yyyy} ${hh}:${mi}`;
}

function fmtNumber(n: number): string {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

const purityLabel = (a: number) =>
  a === 1 ? "Gold 99.99%" : a === 2 ? "Gold 96.50%" : "—";
const commandLabel = (c: number) =>
  c === 2 ? "ซื้อ" : c === 1 ? "ขาย" : "—";
const qtyTypeLabel = (t: string) =>
  t === "baht" ? "บาท" : t === "kg" ? "กิโล" : t;
const statusLabel = (s: string) =>
  s ? s.charAt(0).toUpperCase() + s.slice(1) : "—";

const STATUS_STYLE: Record<string, string> = {
  complete: "bg-green-100 text-green-600",
  cancelled: "bg-gray-200 text-gray-600",
  pending: "bg-yellow-100 text-yellow-700",
  other: "bg-blue-100 text-blue-600",
};

function statusClass(s: string): string {
  return STATUS_STYLE[s] ?? "bg-gray-100 text-gray-600";
}

export default function LeaveOrderPage() {
  const [allItems, setAllItems] = useState<LeaveOrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>(buildInitialFilters);
  const [appliedFilters, setAppliedFilters] =
    useState<Filters>(buildInitialFilters);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<LeaveOrderItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    tradeService
      .getLeaveOrders()
      .then((res) => {
        if (cancelled) return;
        setAllItems(res.data);
      })
      .catch(() => {
        if (cancelled) return;
        setAllItems([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const fromIso = parseDdMmYyyy(appliedFilters.dateFrom);
    const toIso = parseDdMmYyyy(appliedFilters.dateTo);
    const fromTs = fromIso ? new Date(`${fromIso}T00:00:00`).getTime() : null;
    const toTs = toIso ? new Date(`${toIso}T23:59:59.999`).getTime() : null;

    return allItems.filter((item) => {
      if (
        appliedFilters.asset !== "all" &&
        item.asset !== Number(appliedFilters.asset)
      )
        return false;
      if (
        appliedFilters.command !== "all" &&
        item.command !== Number(appliedFilters.command)
      )
        return false;
      if (
        appliedFilters.status !== "all" &&
        item.statusText !== appliedFilters.status
      )
        return false;
      if (fromTs !== null || toTs !== null) {
        const ts = new Date(item.createDate).getTime();
        if (fromTs !== null && ts < fromTs) return false;
        if (toTs !== null && ts > toTs) return false;
      }
      return true;
    });
  }, [allItems, appliedFilters]);

  const totalCount = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  // Clamp page if filters shrink the result set below current page.
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const start = totalCount === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const end = Math.min(page * PAGE_SIZE, totalCount);

  function handleSearch() {
    setPage(1);
    setAppliedFilters(filters);
  }

  function openOrder(item: LeaveOrderItem) {
    setSelected(item);
    setDrawerOpen(true);
  }

  return (
    <>
      <div className="p-4 md:p-6 space-y-4 md:space-y-6">
        <h1 className="text-lg md:text-xl font-semibold">Leave Order</h1>

        {/* FILTER */}
        <Card className="rounded-xl">
          <CardContent className="p-4 md:p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap gap-3 md:gap-4 lg:items-center">
              <Select
                value={filters.asset}
                onValueChange={(v) => setFilters({ ...filters, asset: v })}>
                <SelectTrigger className="w-full lg:w-[160px]">
                  <SelectValue placeholder="ทรัพย์สิน" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทรัพย์สิน</SelectItem>
                  <SelectItem value="2">96.50%</SelectItem>
                  <SelectItem value="1">99.99%</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.command}
                onValueChange={(v) => setFilters({ ...filters, command: v })}>
                <SelectTrigger className="w-full lg:w-[140px]">
                  <SelectValue placeholder="คำสั่ง" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">คำสั่ง</SelectItem>
                  <SelectItem value="2">ซื้อ</SelectItem>
                  <SelectItem value="1">ขาย</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.status}
                onValueChange={(v) => setFilters({ ...filters, status: v })}>
                <SelectTrigger className="w-full lg:w-[140px]">
                  <SelectValue placeholder="สถานะ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">สถานะ</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="complete">Complete</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>

              <DateField
                value={filters.dateFrom}
                onChange={(v) => setFilters({ ...filters, dateFrom: v })}
                className="w-full lg:w-[170px]"
              />
              <DateField
                value={filters.dateTo}
                onChange={(v) => setFilters({ ...filters, dateTo: v })}
                className="w-full lg:w-[170px]"
              />

              <Button
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
                onClick={handleSearch}>
                ค้นหา
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* TABLE */}
        <Card className="rounded-xl">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>วันที่</TableHead>
                  <TableHead>คำสั่ง</TableHead>
                  <TableHead>ทรัพย์สิน</TableHead>
                  <TableHead className="text-right">จำนวน</TableHead>
                  <TableHead className="text-right">ราคาตั้ง</TableHead>
                  <TableHead>สถานะ</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-6 text-gray-500">
                      กำลังโหลด...
                    </TableCell>
                  </TableRow>
                )}
                {!loading && pageItems.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-6 text-gray-500">
                      ไม่พบรายการ
                    </TableCell>
                  </TableRow>
                )}
                {!loading &&
                  pageItems.map((item) => (
                    <TableRow
                      key={item.leaveCode}
                      className="cursor-pointer hover:bg-gray-50 transition"
                      onClick={() => openOrder(item)}>
                      <TableCell>
                        <DateTimeCell iso={item.createDate} />
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            item.command === 2
                              ? "bg-green-100 text-green-600"
                              : "bg-red-100 text-red-500"
                          }`}>
                          {commandLabel(item.command)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {item.asset === 1 ? "99.99%" : "96.50%"}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {fmtNumber(Math.abs(item.quantity))}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {fmtNumber(item.pricePerUnit)}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-3 py-1 text-xs rounded-full ${statusClass(
                            item.statusText
                          )}`}>
                          {statusLabel(item.statusText)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>

            {/* PAGINATION */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 p-4 text-sm text-gray-500">
              <span>
                แสดง {start}–{end} จาก {totalCount.toLocaleString()}
              </span>
              <Pagination
                page={page}
                totalPages={totalPages}
                onChange={(n) => setPage(n)}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <LeaveOrderDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        item={selected}
      />
    </>
  );
}

function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (n: number) => void;
}) {
  const windowStart = Math.max(1, Math.min(page - 1, totalPages - 2));
  const windowEnd = Math.min(totalPages, windowStart + 2);
  const pages: number[] = [];
  for (let i = windowStart; i <= windowEnd; i++) pages.push(i);

  return (
    <div className="flex items-center gap-1">
      <button
        className="px-2 py-1 border rounded disabled:opacity-40"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page">
        &lt;
      </button>

      {windowStart > 1 && (
        <>
          <button
            className="px-3 py-1 border rounded"
            onClick={() => onChange(1)}>
            1
          </button>
          {windowStart > 2 && <span className="px-1">…</span>}
        </>
      )}

      {pages.map((n) => (
        <button
          key={n}
          className={`px-3 py-1 rounded border ${
            n === page
              ? "bg-blue-600 text-white border-blue-600"
              : "border-gray-200"
          }`}
          onClick={() => onChange(n)}>
          {n}
        </button>
      ))}

      {windowEnd < totalPages && (
        <>
          {windowEnd < totalPages - 1 && <span className="px-1">…</span>}
          <button
            className="px-3 py-1 border rounded"
            onClick={() => onChange(totalPages)}>
            {totalPages}
          </button>
        </>
      )}

      <button
        className="px-2 py-1 border rounded disabled:opacity-40"
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Next page">
        &gt;
      </button>
    </div>
  );
}

function LeaveOrderDrawer({
  open,
  onOpenChange,
  item,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  item: LeaveOrderItem | null;
}) {
  if (!item) return null;
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md sm:w-[400px] p-0">
        <div className="bg-white h-full flex flex-col">
          <SheetHeader className="p-4 border-b">
            <SheetTitle>{item.leaveCode}</SheetTitle>
          </SheetHeader>

          <div className="p-4 space-y-3 text-sm">
            <Row label="วันที่/เวลา" value={fmtDateTime(item.createDate)} />
            <Row label="คำสั่ง" value={commandLabel(item.command)} />
            <Row label="ทรัพย์สิน" value={purityLabel(item.asset)} />
            <Row
              label="จำนวน"
              value={`${fmtNumber(Math.abs(item.quantity))} ${qtyTypeLabel(
                item.quantityTypeText
              )}`}
            />
            <Row label="ราคาตั้ง" value={fmtNumber(item.pricePerUnit)} />
            <Row label="สถานะ" value={statusLabel(item.statusText)} />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 border-b pb-2">
      <span className="text-gray-500">{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}
