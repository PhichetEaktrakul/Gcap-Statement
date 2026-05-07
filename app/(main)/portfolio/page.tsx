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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import DateField from "@/components/date-field";
import {
  tradeService,
  type ActiveTicketItem,
} from "@/lib/api/services/trade.service";
import { goldService, type GoldLatest } from "@/lib/api/services/gold.service";
import { parseDdMmYyyy } from "@/lib/date";

const PAGE_SIZE = 10;

type Filters = {
  asset: string;
  command: string;
  dateFrom: string;
  dateTo: string;
};

const initialFilters: Filters = {
  asset: "all",
  command: "all",
  dateFrom: "",
  dateTo: "",
};

type GoldPrices = {
  gold99_buy: number;
  gold99_sell: number;
  gold96_buy: number;
  gold96_sell: number;
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

function fmtDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  // Buddhist year, 2-digit (e.g. 2026 → 69)
  const yy = String((d.getFullYear() + 543) % 100).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${dd}/${mm}/${yy}`;
}

function fmtNumber(n: number): string {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

const channelLabel = (t: string) => (t === "C" ? "Call" : "Leave Order");
const purityLabel = (a: number) =>
  a === 1 ? "Gold 99.99%" : a === 2 ? "Gold 96.50%" : "—";
const commandLabel = (c: number) =>
  c === 2 ? "ซื้อ" : c === 1 ? "ขาย" : "—";
const qtyTypeLabel = (t: string) =>
  t === "baht" ? "บาท" : t === "kg" ? "กิโล" : t;

function getDueDate(item: ActiveTicketItem): string {
  return item.dueDate ?? item.createDate;
}

export default function PortfolioPage() {
  const [allItems, setAllItems] = useState<ActiveTicketItem[]>([]);
  const [, setGoldPrices] = useState<GoldPrices | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [appliedFilters, setAppliedFilters] =
    useState<Filters>(initialFilters);
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [drawerItem, setDrawerItem] = useState<ActiveTicketItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    tradeService
      .getActiveTickets()
      .then((res) => {
        if (!cancelled) setAllItems(res.data);
      })
      .catch(() => {
        if (!cancelled) setAllItems([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    goldService
      .getLatest()
      .then((data: GoldLatest) => {
        if (cancelled) return;
        setGoldPrices({
          gold99_buy: data.gold99_buy,
          gold99_sell: data.gold99_sell,
          gold96_buy: data.gold96_buy,
          gold96_sell: data.gold96_sell,
        });
      })
      .catch(() => {});

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
      if (fromTs !== null || toTs !== null) {
        const ts = new Date(getDueDate(item)).getTime();
        if (fromTs !== null && ts < fromTs) return false;
        if (toTs !== null && ts > toTs) return false;
      }
      return true;
    });
  }, [allItems, appliedFilters]);

  const totalCount = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const start = totalCount === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const end = Math.min(page * PAGE_SIZE, totalCount);

  const qty96 = filtered
    .filter((i) => i.asset === 2)
    .reduce((sum, i) => sum + Math.abs(i.quantity), 0);
  const qty99 = filtered
    .filter((i) => i.asset === 1)
    .reduce((sum, i) => sum + Math.abs(i.quantity), 0);

  function handleSearch() {
    setPage(1);
    setAppliedFilters(filters);
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const allOnPageSelected =
    pageItems.length > 0 &&
    pageItems.every((i) => selectedIds.has(i.ticketCode));

  function toggleSelectAllOnPage() {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allOnPageSelected) {
        pageItems.forEach((i) => next.delete(i.ticketCode));
      } else {
        pageItems.forEach((i) => next.add(i.ticketCode));
      }
      return next;
    });
  }

  function openTicket(item: ActiveTicketItem) {
    setDrawerItem(item);
    setDrawerOpen(true);
  }

  return (
    <>
      <div className="p-4 md:p-6 space-y-4 md:space-y-6">
        {/* TITLE */}
        <h1 className="text-lg md:text-xl font-semibold">Portfolio</h1>

        {/* FILTER CARD */}
        <Card className="rounded-xl">
          <CardContent className="p-4 md:p-5 space-y-4">
            <div className="flex flex-col lg:flex-row lg:flex-wrap gap-3 md:gap-4 lg:items-center">
              <div className="flex items-center gap-2">
                <span className="text-sm shrink-0">Asset:</span>
                <Select
                  value={filters.asset}
                  onValueChange={(v) => setFilters({ ...filters, asset: v })}>
                  <SelectTrigger className="w-full lg:w-[140px]">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="2">96.50%</SelectItem>
                    <SelectItem value="1">99.99%</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm shrink-0">คำสั่ง:</span>
                <Select
                  value={filters.command}
                  onValueChange={(v) =>
                    setFilters({ ...filters, command: v })
                  }>
                  <SelectTrigger className="w-full lg:w-[140px]">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="2">ซื้อ</SelectItem>
                    <SelectItem value="1">ขาย</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <span className="text-sm shrink-0">วันครบดีล:</span>
                <div className="flex items-center gap-2">
                  <DateField
                    value={filters.dateFrom}
                    onChange={(v) =>
                      setFilters({ ...filters, dateFrom: v })
                    }
                    className="w-full sm:w-[170px]"
                  />
                  <span className="text-sm">ถึง</span>
                  <DateField
                    value={filters.dateTo}
                    onChange={(v) => setFilters({ ...filters, dateTo: v })}
                    className="w-full sm:w-[170px]"
                  />
                </div>
              </div>

              <Button
                className="w-full lg:w-auto bg-blue-600 hover:bg-blue-700"
                onClick={handleSearch}>
                ค้นหา
              </Button>
            </div>

            {/* Summary */}
            <div className="text-xs md:text-sm text-gray-500 flex flex-wrap gap-x-4 md:gap-x-6 gap-y-1">
              <span>QTY 96.50 : {qty96 ? fmtNumber(qty96) : "-"}</span>
              <span>QTY 99.99 : {qty99 ? fmtNumber(qty99) : "-"}</span>
              <span>Total : -</span>
              <span className="text-red-500">Unrealize P/L : -3,418.39</span>
            </div>
          </CardContent>
        </Card>

        {/* TABLE */}
        <Card className="rounded-xl">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      checked={allOnPageSelected}
                      onChange={toggleSelectAllOnPage}
                      aria-label="Select all rows on this page"
                    />
                  </TableHead>
                  <TableHead>วันที่/เวลา</TableHead>
                  <TableHead>BY</TableHead>
                  <TableHead>คำสั่ง</TableHead>
                  <TableHead>ทรัพย์สิน</TableHead>
                  <TableHead>จำนวน</TableHead>
                  <TableHead>ราคา</TableHead>
                  <TableHead>TOTAL</TableHead>
                  <TableHead>UNREALIZE</TableHead>
                  <TableHead>วันครบดีล</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading && (
                  <TableRow>
                    <TableCell
                      colSpan={10}
                      className="text-center py-6 text-gray-500">
                      กำลังโหลด...
                    </TableCell>
                  </TableRow>
                )}
                {!loading && pageItems.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={10}
                      className="text-center py-6 text-gray-500">
                      ไม่พบรายการ
                    </TableCell>
                  </TableRow>
                )}
                {!loading &&
                  pageItems.map((item) => {
                    const isSelected = selectedIds.has(item.ticketCode);
                    return (
                      <TableRow
                        key={item.ticketCode}
                        className="cursor-pointer hover:bg-gray-50 transition"
                        onClick={() => openTicket(item)}>
                        <TableCell>
                          <input
                            type="checkbox"
                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                            checked={isSelected}
                            onClick={(e) => e.stopPropagation()}
                            onChange={() => toggleSelect(item.ticketCode)}
                            aria-label={`Select ${item.ticketCode}`}
                          />
                        </TableCell>
                        <TableCell>{fmtDateTime(item.createDate)}</TableCell>
                        <TableCell>
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
                        <TableCell>
                          {fmtNumber(Math.abs(item.quantity))}
                        </TableCell>
                        <TableCell>{fmtNumber(item.pricePerUnit)}</TableCell>
                        <TableCell>
                          {fmtNumber(Math.abs(item.totalPrice))}
                        </TableCell>
                        <TableCell className="text-red-500">-650.00</TableCell>
                        <TableCell>{fmtDate(getDueDate(item))}</TableCell>
                      </TableRow>
                    );
                  })}
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

      <PortfolioDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        item={drawerItem}
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

function PortfolioDrawer({
  open,
  onOpenChange,
  item,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  item: ActiveTicketItem | null;
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
            <Row label="คำสั่ง" value={commandLabel(item.command)} />
            <Row label="ทรัพย์สิน" value={purityLabel(item.asset)} />
            <Row
              label="จำนวน"
              value={`${fmtNumber(Math.abs(item.quantity))} ${qtyTypeLabel(
                item.quantityTypeText
              )}`}
            />
            <Row label="ราคา" value={fmtNumber(item.pricePerUnit)} />
            <Row label="Total" value={fmtNumber(Math.abs(item.totalPrice))} />
            <Row
              label="Unrealize P/L"
              value="-650.00"
              valueClass="text-red-500"
            />
            <Row label="วันครบดีล" value={fmtDate(getDueDate(item))} />
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
