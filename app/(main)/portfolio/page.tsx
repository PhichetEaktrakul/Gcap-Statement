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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import DateField from "@/components/date-field";
import DateTimeCell from "@/components/datetime-cell";
import {
  tradeService,
  type ActiveTicketItem,
} from "@/lib/api/services/trade.service";
import { goldService, type GoldLatest } from "@/lib/api/services/gold.service";
import { parseDdMmYyyy } from "@/lib/date";

const PAGE_SIZE = 10;

type Filters = {
  command: string;
  dateFrom: string;
  dateTo: string;
};

const initialFilters: Filters = {
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
  const yy = String((d.getFullYear() + 543) % 100).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${dd}/${mm}/${yy} ${hh}:${mi}`;
}

function fmtDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
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

// Plain signed: shows the natural minus sign for negatives, no leading + for
// positives. Used for QTY / Total stat cards.
function fmtPlainSigned(n: number): string {
  if (n < 0) return `-${fmtNumber(Math.abs(n))}`;
  return fmtNumber(n);
}

// Signed with explicit + prefix and color cue. Used for Unrealize values
// (per-row column and the aggregate stat card).
function fmtSignedColored(n: number): { text: string; cls: string } {
  if (n > 0) return { text: `+${fmtNumber(n)}`, cls: "text-green-600" };
  if (n < 0) return { text: `-${fmtNumber(Math.abs(n))}`, cls: "text-red-500" };
  return { text: fmtNumber(0), cls: "" };
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

// Per-ticket Unrealize using current spot prices. Returns null when prices
// are not yet loaded or the asset is unknown.
function unrealizeOf(
  item: ActiveTicketItem,
  prices: GoldPrices | null
): number | null {
  if (!prices) return null;
  const qtyAbs = Math.abs(item.quantity);
  const totalAbs = Math.abs(item.totalPrice);

  let spot: number | undefined;
  if (item.asset === 2) {
    spot = item.command === 1 ? prices.gold96_sell : prices.gold96_buy;
  } else if (item.asset === 1) {
    spot = item.command === 1 ? prices.gold99_sell : prices.gold99_buy;
  }
  if (spot === undefined) return null;

  // ขาย (sell): totalPrice − spotSell × qty
  // ซื้อ (buy):  spotBuy × qty − totalPrice
  return item.command === 1 ? totalAbs - spot * qtyAbs : spot * qtyAbs - totalAbs;
}

export default function PortfolioPage() {
  const [allItems, setAllItems] = useState<ActiveTicketItem[]>([]);
  const [goldPrices, setGoldPrices] = useState<GoldPrices | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [appliedFilters, setAppliedFilters] =
    useState<Filters>(initialFilters);
  const [page96, setPage96] = useState(1);
  const [page99, setPage99] = useState(1);
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

  const items96 = useMemo(
    () => filtered.filter((i) => i.asset === 2),
    [filtered]
  );
  const items99 = useMemo(
    () => filtered.filter((i) => i.asset === 1),
    [filtered]
  );

  const totalPages96 = Math.max(1, Math.ceil(items96.length / PAGE_SIZE));
  const totalPages99 = Math.max(1, Math.ceil(items99.length / PAGE_SIZE));

  useEffect(() => {
    if (page96 > totalPages96) setPage96(totalPages96);
  }, [page96, totalPages96]);
  useEffect(() => {
    if (page99 > totalPages99) setPage99(totalPages99);
  }, [page99, totalPages99]);

  const pageItems96 = items96.slice(
    (page96 - 1) * PAGE_SIZE,
    page96 * PAGE_SIZE
  );
  const pageItems99 = items99.slice(
    (page99 - 1) * PAGE_SIZE,
    page99 * PAGE_SIZE
  );

  function handleSearch() {
    setPage96(1);
    setPage99(1);
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

  function selectAllOnPage(rows: ActiveTicketItem[]) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      const allSelected = rows.every((i) => next.has(i.ticketCode));
      if (allSelected) rows.forEach((i) => next.delete(i.ticketCode));
      else rows.forEach((i) => next.add(i.ticketCode));
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
          <CardContent>
            <div className="flex flex-col lg:flex-row lg:flex-wrap gap-3 md:gap-4 lg:items-center">
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
          </CardContent>
        </Card>

        {/* TICKET 96.50% */}
        <TicketSection
          title="Ticket 96.50%"
          qtyLabel="QTY 96.50"
          loading={loading}
          allItems={items96}
          pageItems={pageItems96}
          page={page96}
          totalPages={totalPages96}
          onPageChange={setPage96}
          goldPrices={goldPrices}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
          onSelectAllOnPage={() => selectAllOnPage(pageItems96)}
          onOpen={openTicket}
        />

        {/* TICKET 99.99% */}
        <TicketSection
          title="Ticket 99.99%"
          qtyLabel="QTY 99.99"
          loading={loading}
          allItems={items99}
          pageItems={pageItems99}
          page={page99}
          totalPages={totalPages99}
          onPageChange={setPage99}
          goldPrices={goldPrices}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
          onSelectAllOnPage={() => selectAllOnPage(pageItems99)}
          onOpen={openTicket}
        />
      </div>

      <PortfolioDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        item={drawerItem}
        goldPrices={goldPrices}
      />
    </>
  );
}

function StatCard({
  label,
  value,
  valueClass = "",
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="bg-gray-50 rounded-lg px-3 py-2 min-w-[110px]">
      <div className="text-[11px] text-gray-500 leading-tight">{label}</div>
      <div className={`font-semibold text-sm mt-0.5 ${valueClass}`}>
        {value}
      </div>
    </div>
  );
}

function TicketSection({
  title,
  qtyLabel,
  loading,
  allItems,
  pageItems,
  page,
  totalPages,
  onPageChange,
  goldPrices,
  selectedIds,
  onToggleSelect,
  onSelectAllOnPage,
  onOpen,
}: {
  title: string;
  qtyLabel: string;
  loading: boolean;
  allItems: ActiveTicketItem[];
  pageItems: ActiveTicketItem[];
  page: number;
  totalPages: number;
  onPageChange: (n: number) => void;
  goldPrices: GoldPrices | null;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onSelectAllOnPage: () => void;
  onOpen: (item: ActiveTicketItem) => void;
}) {
  const start = allItems.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const end = Math.min(page * PAGE_SIZE, allItems.length);
  const allOnPageSelected =
    pageItems.length > 0 &&
    pageItems.every((i) => selectedIds.has(i.ticketCode));

  // QTY / Total: based on rows that ARE checked.
  const checked = allItems.filter((i) => selectedIds.has(i.ticketCode));
  let qtyText = "--";
  let totalText = "--";
  if (checked.length > 0) {
    let qSum = 0;
    let tSum = 0;
    for (const item of checked) {
      const sign = item.command === 1 ? -1 : 1; // ขาย = negative, ซื้อ = positive
      qSum += sign * Math.abs(item.quantity);
      tSum += sign * Math.abs(item.totalPrice);
    }
    qtyText = fmtPlainSigned(qSum);
    totalText = fmtPlainSigned(tSum);
  }

  // Unrealize P/L: sum of unrealize for rows that are NOT checked.
  // "--" when every row is checked or prices haven't loaded.
  const unchecked = allItems.filter((i) => !selectedIds.has(i.ticketCode));
  let unrText = "--";
  let unrCls = "";
  if (unchecked.length > 0 && goldPrices) {
    let sum = 0;
    let ok = true;
    for (const item of unchecked) {
      const u = unrealizeOf(item, goldPrices);
      if (u === null) {
        ok = false;
        break;
      }
      sum += u;
    }
    if (ok) {
      const f = fmtSignedColored(sum);
      unrText = f.text;
      unrCls = f.cls;
    }
  }

  return (
    <Card className="rounded-xl">
      {/* HEADER WITH STATS */}
      <div className="flex flex-col gap-3 lg:flex-row lg:justify-between lg:items-center px-4 md:px-5">
        <h2 className="text-base md:text-lg font-semibold">{title}</h2>
        <div className="flex flex-wrap gap-2 items-center">
          <StatCard label={qtyLabel} value={qtyText} />
          <StatCard label="Total" value={totalText} />
          <StatCard label="Unrealize P/L" value={unrText} valueClass={unrCls} />
          <Button className="bg-blue-600 hover:bg-blue-700" size="sm">
            คำนวน
          </Button>
        </div>
      </div>

      {/* TABLE */}
      <div className="px-4 md:px-5">
        <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10 pl-4 md:pl-5">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                checked={allOnPageSelected}
                onChange={onSelectAllOnPage}
                aria-label="Select all rows on this page"
              />
            </TableHead>
            <TableHead>วันที่/เวลา</TableHead>
            <TableHead>BY</TableHead>
            <TableHead>คำสั่ง</TableHead>
            <TableHead className="text-right">จำนวน</TableHead>
            <TableHead className="text-right">ราคา</TableHead>
            <TableHead className="text-right">TOTAL</TableHead>
            <TableHead className="text-right">UNREALIZE</TableHead>
            <TableHead>วันครบดีล</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {loading && (
            <TableRow>
              <TableCell
                colSpan={9}
                className="text-center py-6 text-gray-500">
                กำลังโหลด...
              </TableCell>
            </TableRow>
          )}
          {!loading && pageItems.length === 0 && (
            <TableRow>
              <TableCell colSpan={9} className="py-10">
                <div className="flex flex-col items-center gap-2 text-gray-400">
                  <Inbox className="w-10 h-10" strokeWidth={1.5} />
                  <span className="text-sm">ไม่พบรายการ</span>
                </div>
              </TableCell>
            </TableRow>
          )}
          {!loading &&
            pageItems.map((item) => {
              const isSelected = selectedIds.has(item.ticketCode);
              const u = unrealizeOf(item, goldPrices);
              const uFormatted =
                u === null ? { text: "—", cls: "" } : fmtSignedColored(u);
              return (
                <TableRow
                  key={item.ticketCode}
                  className="cursor-pointer hover:bg-gray-50 transition"
                  onClick={() => onOpen(item)}>
                  <TableCell className="pl-4 md:pl-5">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      checked={isSelected}
                      onClick={(e) => e.stopPropagation()}
                      onChange={() => onToggleSelect(item.ticketCode)}
                      aria-label={`Select ${item.ticketCode}`}
                    />
                  </TableCell>
                  <TableCell>
                    <DateTimeCell iso={item.createDate} />
                  </TableCell>
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
                  <TableCell className="text-right tabular-nums">
                    {fmtNumber(Math.abs(item.quantity))}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {fmtNumber(item.pricePerUnit)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {fmtNumber(Math.abs(item.totalPrice))}
                  </TableCell>
                  <TableCell className={`text-right tabular-nums ${uFormatted.cls}`}>
                    {uFormatted.text}
                  </TableCell>
                  <TableCell>{fmtDate(getDueDate(item))}</TableCell>
                </TableRow>
              );
            })}
        </TableBody>
      </Table>
      </div>

      {/* PAGINATION */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 px-4 md:px-5 text-sm text-gray-500">
        <span>
          แสดง {start}–{end} จาก {allItems.length.toLocaleString()}
        </span>
        <Pagination
          page={page}
          totalPages={totalPages}
          onChange={onPageChange}
        />
      </div>
    </Card>
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
  goldPrices,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  item: ActiveTicketItem | null;
  goldPrices: GoldPrices | null;
}) {
  if (!item) return null;
  const u = unrealizeOf(item, goldPrices);
  const uFormatted =
    u === null ? { text: "—", cls: "" } : fmtSignedColored(u);

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
              value={uFormatted.text}
              valueClass={uFormatted.cls}
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
