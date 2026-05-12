"use client";

import { useEffect, useMemo, useState } from "react";
import { Inbox } from "lucide-react";
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

const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;
const DEFAULT_PAGE_SIZE = 10;

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

function StatusIcon({ status, size = 24 }: { status: string; size?: number }) {
  if (status === "pending") {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        role="img"
        aria-label="Pending">
        <circle cx="12" cy="12" r="10" fill="#3B82F6" />
        <path
          d="M12 7V12L15 14"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (status === "complete") {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        role="img"
        aria-label="Complete">
        <circle cx="12" cy="12" r="10" fill="#22C55E" />
        <path
          d="M7 12L10 15L17 8"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (status === "cancelled") {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        role="img"
        aria-label="Cancelled">
        <circle cx="12" cy="12" r="10" fill="#EF4444" />
        <path
          d="M8 8L16 16M16 8L8 16"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  return (
    <span className="text-xs text-gray-500">{statusLabel(status)}</span>
  );
}

export default function LeaveOrderPage() {
  const [allItems, setAllItems] = useState<LeaveOrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>(buildInitialFilters);
  const [appliedFilters, setAppliedFilters] =
    useState<Filters>(buildInitialFilters);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);
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
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  // Clamp page if filters shrink the result set below current page.
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);
  const start = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalCount);

  function handleSearch() {
    setPage(1);
    setAppliedFilters(filters);
  }

  function handlePageSizeChange(n: number) {
    setPageSize(n);
    setPage(1);
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
            <div className="px-4 md:px-5">
              <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>วันที่</TableHead>
                  <TableHead>คำสั่ง</TableHead>
                  <TableHead>ทรัพย์สิน</TableHead>
                  <TableHead className="text-right">จำนวน</TableHead>
                  <TableHead className="text-right">ราคาตั้ง</TableHead>
                  <TableHead className="text-center">สถานะ</TableHead>
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
                    <TableCell colSpan={6} className="py-10">
                      <div className="flex flex-col items-center gap-2 text-gray-400">
                        <Inbox className="w-10 h-10" strokeWidth={1.5} />
                        <span className="text-sm">ไม่พบรายการ</span>
                      </div>
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
                          className={`inline-block min-w-[3rem] text-center px-2 py-1 text-xs rounded-full ${
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
                        <div className="flex justify-center">
                          <StatusIcon status={item.statusText} />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
            </div>

            {/* PAGINATION */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 p-4 text-sm text-gray-500">
              <div className="flex flex-wrap items-center gap-3">
                <span>
                  แสดง {start}–{end} จาก {totalCount.toLocaleString()}
                </span>
                <PageSizeSelect
                  value={pageSize}
                  onChange={handlePageSizeChange}
                />
              </div>
              <Pagination
                page={page}
                totalPages={totalPages}
                onChange={(n) => setPage(n)}
              />
            </div>

            {/* STATUS LEGEND */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 md:px-5 pb-4 text-xs text-gray-600">
              <span className="flex items-center gap-1.5">
                <StatusIcon status="pending" size={18} /> Pending
              </span>
              <span className="flex items-center gap-1.5">
                <StatusIcon status="complete" size={18} /> Complete
              </span>
              <span className="flex items-center gap-1.5">
                <StatusIcon status="cancelled" size={18} /> Cancelled
              </span>
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

function PageSizeSelect({
  value,
  onChange,
}: {
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-gray-500">/ หน้า</span>
      <Select value={String(value)} onValueChange={(v) => onChange(Number(v))}>
        <SelectTrigger className="h-8 w-[72px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {PAGE_SIZE_OPTIONS.map((n) => (
            <SelectItem key={n} value={String(n)}>
              {n}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
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

  const [gotoValue, setGotoValue] = useState("");
  function commitGoto() {
    const v = parseInt(gotoValue, 10);
    if (Number.isFinite(v) && v >= 1 && v <= totalPages) {
      onChange(v);
    }
    setGotoValue("");
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-1">
        <span className="text-xs text-gray-500">ไปหน้า</span>
        <input
          type="number"
          min={1}
          max={totalPages}
          value={gotoValue}
          onChange={(e) => setGotoValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") commitGoto();
          }}
          onBlur={commitGoto}
          className="w-16 px-2 py-1 border rounded text-sm"
          placeholder={String(page)}
          aria-label="Go to page"
        />
      </div>
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
