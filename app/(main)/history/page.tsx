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
  type TicketHistoryItem,
  type TicketHistoryParams,
} from "@/lib/api/services/trade.service";
import { parseDdMmYyyy } from "@/lib/date";
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
  command: string; // "all" | "1" | "2"
  asset: string; // "all" | "1" | "2"
  dateFrom: string;
  dateTo: string;
};

const initialFilters: Filters = {
  command: "",
  asset: "",
  dateFrom: "",
  dateTo: "",
};

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

function fmtNumber(n: number, maxFraction = 2): string {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: maxFraction,
  });
}

function fmtPlainSigned(n: number, maxFraction = 2): string {
  if (n < 0) return `-${fmtNumber(Math.abs(n), maxFraction)}`;
  return fmtNumber(n, maxFraction);
}

function truncFmt(n: number, decimals: number): string {
  const factor = 10 ** decimals;
  const truncated = Math.trunc(n * factor) / factor;
  return truncated.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function fmtTruncSigned(n: number, decimals = 2): string {
  if (n < 0) return `-${truncFmt(Math.abs(n), decimals)}`;
  return truncFmt(n, decimals);
}

const qtyDecimalsForAsset = (asset: number) => (asset === 1 ? 9 : 5);

const channelLabel = (t: string) => (t === "C" ? "Call" : "Leave Order");
const purityLabel = (a: number) => a === 1 ? "Gold 99.99%" : a === 2 ? "Gold 96.50%" : "—";
const commandLabel = (c: number) => c === 2 ? "ซื้อ" : c === 1 ? "ขาย" : "—";
const qtyTypeLabel = (t: string) => t === "baht" ? "BAHT" : t === "kg" ? "KG" : t;

export default function HistoryPage() {
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState<Filters>(initialFilters);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);
  const [sort, setSort] = useState<SortState>(NO_SORT);

  function handleSort(key: string) {
    setSort((s) => nextSortState(s, key));
  }

  function getSortKey(item: TicketHistoryItem, key: string): string | number {
    switch (key) {
      case "createDate":
        return new Date(item.createDate).getTime();
      case "ticketType":
        return item.ticketType;
      case "command":
        return item.command;
      case "asset":
        return item.asset;
      case "quantity":
        return item.quantity;
      case "pricePerUnit":
        return item.pricePerUnit;
      case "totalPrice":
        return item.totalPrice;
      default:
        return "";
    }
  }
  
  const [items, setItems] = useState<TicketHistoryItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<TicketHistoryItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const params: TicketHistoryParams = {
      Page: page,
      PageSize: pageSize,
    };
    if (appliedFilters.command && appliedFilters.command !== "all")
      params["Filter.Command"] = Number(appliedFilters.command) as 1 | 2;
    if (appliedFilters.asset && appliedFilters.asset !== "all")
      params["Filter.AssetId"] = Number(appliedFilters.asset) as 1 | 2;
    const fromIso = parseDdMmYyyy(appliedFilters.dateFrom);
    if (fromIso) params["Filter.DateFrom"] = fromIso;
    const toIso = parseDdMmYyyy(appliedFilters.dateTo);
    if (toIso) params["Filter.DateTo"] = toIso;

    let cancelled = false;
    setLoading(true);
    tradeService
      .getTicketHistory(params)
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
    appliedFilters.dateFrom,
    appliedFilters.dateTo,
    page,
    pageSize,
  ]);

  function handleSearch() {
    setPage(1);
    setAppliedFilters(filters);
  }

  function handlePageSizeChange(n: number) {
    setPageSize(n);
    setPage(1);
  }

  function openTicket(item: TicketHistoryItem) {
    setSelected(item);
    setDrawerOpen(true);
  }

  const sortedItems = useMemo(
    () => sortItems(items, sort, getSortKey),
    [items, sort]
  );

  const start = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalCount);

  return (
    <>
      <div className="p-4 md:p-6 space-y-4 md:space-y-6">
        <h1 className="text-lg md:text-xl font-semibold">History</h1>

        {/* FILTER */}
        <Card className="rounded-xl">
          <CardContent className="p-4 md:p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap gap-3 md:gap-4 lg:items-center">
              <Select
                value={filters.asset}
                onValueChange={(v) => setFilters({ ...filters, asset: v })}>
                <SelectTrigger className="w-full lg:w-40">
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
                <SelectTrigger className="w-full lg:w-35">
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

              <DateField
                value={filters.dateFrom}
                onChange={(v) => setFilters({ ...filters, dateFrom: v })}
                className="w-full lg:w-42.5"
              />
              <DateField
                value={filters.dateTo}
                onChange={(v) => setFilters({ ...filters, dateTo: v })}
                className="w-full lg:w-42.5"
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
                    วันที่/เวลา
                  </SortableHead>
                  <SortableHead
                    columnKey="ticketType"
                    state={sort}
                    onSort={handleSort}
                    className="hidden md:table-cell">
                    ช่องทาง
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
                    ราคา
                  </SortableHead>
                  <SortableHead
                    columnKey="totalPrice"
                    state={sort}
                    onSort={handleSort}
                    align="right">
                    รวม
                  </SortableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-6 text-gray-500">
                      กำลังโหลด...
                    </TableCell>
                  </TableRow>
                )}
                {!loading && items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="py-10">
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
                      key={item.ticketCode}
                      className="cursor-pointer hover:bg-gray-50 transition"
                      onClick={() => openTicket(item)}>
                      <TableCell>
                        <DateTimeCell iso={item.createDate} />
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            item.ticketType === "C"
                              ? "bg-blue-100 text-blue-500"
                              : "bg-green-100 text-green-600"
                          }`}>
                          {item.ticketType}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-block min-w-12 text-center px-2 py-1 text-xs rounded-full ${
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
                      <TableCell
                        className={`text-right tabular-nums ${
                          item.quantity < 0 ? "text-red-500" : ""
                        }`}>
                        {fmtPlainSigned(
                          item.quantity,
                          qtyDecimalsForAsset(item.asset)
                        )}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {fmtNumber(item.pricePerUnit)}
                      </TableCell>
                      <TableCell
                        className={`text-right tabular-nums ${
                          item.totalPrice < 0 ? "text-red-500" : ""
                        }`}>
                        {fmtTruncSigned(item.totalPrice)}
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
          </CardContent>
        </Card>
      </div>

      <TicketDrawer
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
        <SelectTrigger className="h-8 w-18">
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

function TicketDrawer({
  open,
  onOpenChange,
  item,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  item: TicketHistoryItem | null;
}) {
  if (!item) return null;
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md sm:w-[400px] p-0">
        <div className="bg-white h-full flex flex-col">
          <SheetHeader className="p-4 border-b">
            <SheetTitle>{item.ticketCode}</SheetTitle>
          </SheetHeader>

          <div className="p-4 space-y-3 text-sm">
            <Row label="วันที่/เวลา" value={fmtDateTime(item.createDate)} />
            <Row label="ช่องทาง" value={channelLabel(item.ticketType)} />
            <Row label="ทรัพย์สิน" value={purityLabel(item.asset)} />
            <Row label="คำสั่ง" value={commandLabel(item.command)} />
            <Row
              label="จำนวน"
              value={`${fmtPlainSigned(
                item.quantity,
                qtyDecimalsForAsset(item.asset)
              )} ${qtyTypeLabel(item.quantityTypeText)}`}
              valueClass={item.quantity < 0 ? "text-red-500" : ""}
            />
            <Row label="ราคา" value={fmtNumber(item.pricePerUnit)} />
            <Row
              label="รวม"
              value={fmtTruncSigned(item.totalPrice)}
              valueClass={item.totalPrice < 0 ? "text-red-500" : ""}
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Row({
  label,
  value,
  valueClass = "",
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex justify-between gap-3 border-b pb-2">
      <span className="text-gray-500">{label}</span>
      <span className={`text-right ${valueClass}`}>{value}</span>
    </div>
  );
}
