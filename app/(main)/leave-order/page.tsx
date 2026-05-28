"use client";

import { useEffect, useMemo, useState } from "react";
import { Inbox } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  tradeService,
  type LeaveOrderItem,
  type LeaveOrderParams,
  type LeaveStatusCode,
  type TicketAsset,
  type TicketCommand,
} from "@/lib/api/services/trade.service";
import { dateToDdMmYyyy, parseDdMmYyyy } from "@/lib/date";
import DateField from "@/components/date-field";
import DateTimeCell from "@/components/datetime-cell";
import {
  NO_SORT,
  SortableHead,
  nextSortState,
  sortItems,
  type SortState,
} from "@/components/sortable-head";

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
    asset: "",
    command: "",
    status: "",
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

// dd/mm/yyyy (4-digit Buddhist year) + HH:mm — used in the drawer's status
// label for completed/cancelled orders, e.g. "สถานะ (26/05/2569 16:30)".
function fmtActionDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const yyyy = String(d.getFullYear() + 543).padStart(4, "0");
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
  t === "baht" ? "BAHT" : t === "kg" ? "KG" : t;
const statusLabel = (s: string) =>
  s ? s.charAt(0).toUpperCase() + s.slice(1) : "—";

// Same palette as <StatusIcon/>. Used for the mobile row-leading color bar
// that supplements the status column on narrow screens.
const statusColor = (s: string) =>
  s === "pending"
    ? "#3B82F6"
    : s === "complete"
    ? "#22C55E"
    : s === "cancelled"
    ? "#EF4444"
    : "transparent";

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
        aria-label="Waiting">
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
  const [filters, setFilters] = useState<Filters>(buildInitialFilters);
  const [appliedFilters, setAppliedFilters] =
    useState<Filters>(buildInitialFilters);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);
  const [sort, setSort] = useState<SortState>(NO_SORT);

  function handleSort(key: string) {
    setSort((s) => nextSortState(s, key));
  }

  function getSortKey(item: LeaveOrderItem, key: string): string | number {
    switch (key) {
      case "createDate":
        return new Date(item.createDate).getTime();
      case "command":
        return item.command;
      case "asset":
        return item.asset;
      case "quantity":
        return item.quantity;
      case "pricePerUnit":
        return item.pricePerUnit;
      case "statusText":
        return item.statusText;
      default:
        return "";
    }
  }

  const [items, setItems] = useState<LeaveOrderItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<LeaveOrderItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  // Bumped on every ค้นหา click to force a refetch even when nothing else
  // in the effect's dep array has changed.
  const [refreshNonce, setRefreshNonce] = useState(0);

  useEffect(() => {
    const params: LeaveOrderParams = {
      Page: page,
      PageSize: pageSize,
    };
    if (appliedFilters.command && appliedFilters.command !== "all")
      params["Filter.Command"] = Number(appliedFilters.command) as TicketCommand;
    if (appliedFilters.asset && appliedFilters.asset !== "all")
      params["Filter.AssetId"] = Number(appliedFilters.asset) as TicketAsset;
    if (appliedFilters.status && appliedFilters.status !== "all")
      params["Filter.LeaveStatus"] = Number(appliedFilters.status) as LeaveStatusCode;
    const fromIso = parseDdMmYyyy(appliedFilters.dateFrom);
    if (fromIso) params["Filter.DateFrom"] = fromIso;
    const toIso = parseDdMmYyyy(appliedFilters.dateTo);
    if (toIso) params["Filter.DateTo"] = toIso;

    let cancelled = false;
    setLoading(true);
    tradeService
      .getLeaveOrders(params)
      .then((res) => {
        if (cancelled) return;
        setItems(res.data.items);
        setTotalCount(res.data.totalCount);
        setTotalPages(res.data.totalPages || 1);
      })
      .catch(() => {
        if (cancelled) return;
        setItems([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [
    appliedFilters.command,
    appliedFilters.asset,
    appliedFilters.status,
    appliedFilters.dateFrom,
    appliedFilters.dateTo,
    page,
    pageSize,
    refreshNonce,
  ]);

  const sortedItems = useMemo(
    () => sortItems(items, sort, getSortKey),
    [items, sort]
  );

  const start = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalCount);

  function handleSearch() {
    setPage(1);
    setAppliedFilters(filters);
    setRefreshNonce((n) => n + 1);
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
                  <SelectGroup>
                    <SelectLabel>ทรัพย์สิน</SelectLabel>
                    <SelectSeparator />
                    <SelectItem value="all">ทั้งหมด</SelectItem>
                    <SelectItem value="2">96.50%</SelectItem>
                    <SelectItem value="1">99.99%</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>

              <Select
                value={filters.command}
                onValueChange={(v) => setFilters({ ...filters, command: v })}>
                <SelectTrigger className="w-full lg:w-[140px]">
                  <SelectValue placeholder="คำสั่ง" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>คำสั่ง</SelectLabel>
                    <SelectSeparator />
                    <SelectItem value="all">ทั้งหมด</SelectItem>
                    <SelectItem value="2">ซื้อ</SelectItem>
                    <SelectItem value="1">ขาย</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>

              <Select
                value={filters.status}
                onValueChange={(v) => setFilters({ ...filters, status: v })}>
                <SelectTrigger className="w-full lg:w-[140px]">
                  <SelectValue placeholder="สถานะ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>สถานะ</SelectLabel>
                    <SelectSeparator />
                    <SelectItem value="all">ทั้งหมด</SelectItem>
                    <SelectItem value="3">Waiting</SelectItem>
                    <SelectItem value="1">Complete</SelectItem>
                    <SelectItem value="2">Cancelled</SelectItem>
                  </SelectGroup>
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
                className="w-full sm:w-auto bg-[#1959A3] hover:bg-[#144a8a]"
                onClick={handleSearch}
                disabled={loading}>
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
                  <SortableHead columnKey="createDate" state={sort} onSort={handleSort}>
                    วันที่
                  </SortableHead>
                  <SortableHead columnKey="command" state={sort} onSort={handleSort}>
                    คำสั่ง
                  </SortableHead>
                  <SortableHead columnKey="asset" state={sort} onSort={handleSort}>
                    ทรัพย์สิน
                  </SortableHead>
                  <SortableHead
                    columnKey="quantity"
                    state={sort}
                    onSort={handleSort}
                    align="right">
                    จำนวน
                  </SortableHead>
                  <SortableHead
                    columnKey="pricePerUnit"
                    state={sort}
                    onSort={handleSort}
                    align="right">
                    ราคาตั้ง
                  </SortableHead>
                  <SortableHead
                    columnKey="statusText"
                    state={sort}
                    onSort={handleSort}
                    align="center">
                    สถานะ
                  </SortableHead>
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
                {!loading && sortedItems.length === 0 && (
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
                  sortedItems.map((item) => (
                    <TableRow
                      key={item.leaveCode}
                      // Mobile only (< md): show the status color as a 4px
                      // leading bar on the row alongside the status column.
                      // `!` beats TableBody's `[&_tr:last-child]:border-0`, which
                      // would otherwise zero the bar on the last row.
                      style={{ borderLeftColor: statusColor(item.statusText) }}
                      className="max-md:border-l-4! cursor-pointer hover:bg-gray-50 transition"
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
                <StatusIcon status="pending" size={18} /> Waiting
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
      <span className="text-xs text-gray-500">/ รายการ</span>
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
              ? "bg-[#1959A3] text-white border-[#1959A3]"
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
            <Row
              label={
                (item.statusText === "complete" ||
                  item.statusText === "cancelled") &&
                item.actionDate
                  ? `สถานะ (${fmtActionDateTime(item.actionDate)})`
                  : "สถานะ"
              }
              value={item.statusText === "pending" ? "Waiting" : item.statusText}
            />
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
