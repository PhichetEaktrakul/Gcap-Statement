"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronDown, Inbox } from "lucide-react";
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
  NO_SORT,
  SortableHead,
  nextSortState,
  sortItems,
  type SortState,
} from "@/components/sortable-head";
import {
  tradeService,
  type ActiveTicketItem,
} from "@/lib/api/services/trade.service";
import { goldService, type GoldLatest } from "@/lib/api/services/gold.service";
import { parseDdMmYyyy } from "@/lib/date";

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
  updateTime: string;
};

function fmtDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const yy = String((d.getFullYear() + 543) % 100).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${dd}/${mm}/${yy}`;
}

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

// Truncate toward zero at N decimals (1.019 → 1.01, never rounds up).
// Pads to exactly N decimals (85150 → 85,150.00).
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

function fmtTruncColored(
  n: number,
  decimals = 2
): { text: string; cls: string } {
  if (n > 0) return { text: `+${truncFmt(n, decimals)}`, cls: "text-green-600" };
  if (n < 0)
    return { text: `-${truncFmt(Math.abs(n), decimals)}`, cls: "text-red-500" };
  return { text: truncFmt(0, decimals), cls: "" };
}

// Truncate toward zero, then format with 0..maxDecimals fractional digits
// (no padding). 1 → "1", 1.12345 → "1.12345", 1.1234567890 → "1.123456789".
function truncFmtMax(n: number, maxDecimals: number): string {
  const factor = 10 ** maxDecimals;
  const truncated = Math.trunc(n * factor) / factor;
  return truncated.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: maxDecimals,
  });
}

function fmtTruncSignedMax(n: number, maxDecimals: number): string {
  if (n < 0) return `-${truncFmtMax(Math.abs(n), maxDecimals)}`;
  return truncFmtMax(n, maxDecimals);
}

const qtyDecimalsForAsset = (asset: number) => (asset === 1 ? 9 : 5);

const channelLabel = (t: string) => (t === "C" ? "Call" : "Leave Order");
const purityLabel = (a: number) =>
  a === 1 ? "Gold 99.99%" : a === 2 ? "Gold 96.50%" : "—";
const commandLabel = (c: number) =>
  c === 2 ? "ซื้อ" : c === 1 ? "ขาย" : "—";
const qtyTypeLabel = (t: string) =>
  t === "baht" ? "BAHT" : t === "kg" ? "KG" : t;

function getDueDate(item: ActiveTicketItem): string {
  return item.dueDate ?? item.createDate;
}

function unrealizeOf(
  item: ActiveTicketItem,
  prices: GoldPrices | null
): number | null {
  // 99.99%: (qty * spot * 65.6) − (qty * pricePerUnit * 65.6).
  // spot = gold99_sell for ขาย (command 1), gold99_buy for ซื้อ (command 2).
  if (item.asset === 1) {
    if (!prices) return null;
    const spot =
      item.command === 1 ? prices.gold99_sell : prices.gold99_buy;
    return (
      item.quantity * spot * 65.6 - item.quantity * item.pricePerUnit * 65.6
    );
  }

  // 96.50%: compare totalPrice against current spot.
  if (!prices) return null;
  const qtyAbs = Math.abs(item.quantity);
  const totalAbs = Math.abs(item.totalPrice);
  const spot =
    item.command === 1 ? prices.gold96_sell : prices.gold96_buy;
  return item.command === 1 ? totalAbs - spot * qtyAbs : spot * qtyAbs - totalAbs;
}

export default function PortfolioPage() {
  const [allItems, setAllItems] = useState<ActiveTicketItem[]>([]);
  const [goldPrices, setGoldPrices] = useState<GoldPrices | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [appliedFilters, setAppliedFilters] =
    useState<Filters>(initialFilters);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [committedSelection, setCommittedSelection] = useState<Set<string>>(
    new Set()
  );
  const [drawerItem, setDrawerItem] = useState<ActiveTicketItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const loadActiveTickets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await tradeService.getActiveTickets();
      setAllItems(res.data);
    } catch {
      setAllItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadActiveTickets();

    let cancelled = false;
    goldService
      .getLatest()
      .then((data: GoldLatest) => {
        if (cancelled) return;
        setGoldPrices({
          gold99_buy: data.gold99_buy,
          gold99_sell: data.gold99_sell,
          gold96_buy: data.gold96_buy,
          gold96_sell: data.gold96_sell,
          updateTime: data.created_at,
        });
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [loadActiveTickets]);

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

  const stats = useMemo(() => {
    const sumSignedQty = (rows: ActiveTicketItem[]) => {
      let s = 0;
      for (const item of rows) {
        const sign = item.command === 1 ? -1 : 1;
        s += sign * Math.abs(item.quantity);
      }
      return s;
    };

    const checked96 = items96.filter((i) =>
      committedSelection.has(i.ticketCode)
    );
    const checked99 = items99.filter((i) =>
      committedSelection.has(i.ticketCode)
    );
    const allChecked = [...checked96, ...checked99];
    const allUnchecked = [...items96, ...items99].filter(
      (i) => !committedSelection.has(i.ticketCode)
    );

    const sumQty96 = sumSignedQty(checked96);
    const sumQty99 = sumSignedQty(checked99);
    const sumTotal96 = checked96.reduce((s, i) => s + i.totalPrice, 0);
    const sumTotal99 = checked99.reduce((s, i) => s + i.totalPrice, 0);

    const qty96 = checked96.length === 0 ? "--" : fmtTruncSignedMax(sumQty96, 9);
    const qty99 = checked99.length === 0 ? "--" : fmtTruncSignedMax(sumQty99, 9);
    const qty96Cls = checked96.length > 0 && sumQty96 < 0 ? "text-red-500" : "";
    const qty99Cls = checked99.length > 0 && sumQty99 < 0 ? "text-red-500" : "";

    let mean96Text: string | undefined;
    if (checked96.length > 0 && sumQty96 !== 0) {
      mean96Text = fmtNumber(Math.abs(sumTotal96 / sumQty96));
    }
    let mean99Text: string | undefined;
    if (checked99.length > 0 && sumQty99 !== 0) {
      mean99Text = fmtNumber(Math.abs(sumTotal99 / (sumQty99 * 65.6)));
    }

    // Total = sum of raw totalPrice for the CHECKED rows (no sign flipping —
    // API's natural sign is preserved). Negative => red.
    let totalText = "--";
    let totalCls = "";
    if (allChecked.length > 0) {
      let sum = 0;
      for (const item of allChecked) sum += item.totalPrice;
      totalText = fmtTruncSigned(sum, 2);
      totalCls = sum < 0 ? "text-red-500" : "";
    }

    // Unrealize P/L = sum of UNREALIZE for the UNCHECKED rows.
    let unrText = "--";
    let unrCls = "";
    if (allUnchecked.length > 0 && goldPrices) {
      let sum = 0;
      let ok = true;
      for (const item of allUnchecked) {
        const u = unrealizeOf(item, goldPrices);
        if (u === null) {
          ok = false;
          break;
        }
        sum += u;
      }
      if (ok) {
        const f = fmtTruncColored(sum, 2);
        unrText = f.text;
        unrCls = f.cls;
      }
    }

    // Gain/Loss = weighted-avg vs spot on CHECKED rows, summed across assets.
    let gainLossText = "--";
    let gainLossCls = "";
    if (allChecked.length > 0 && goldPrices) {
      let gain96 = 0;
      if (checked96.length > 0) {
        const sumTotal = checked96.reduce((s, i) => s + i.totalPrice, 0);
        const sumQty = sumSignedQty(checked96);
        if (sumQty !== 0) {
          const mean = Math.abs(sumTotal / sumQty);
          const spot = sumQty > 0 ? goldPrices.gold96_buy : goldPrices.gold96_sell;
          gain96 = (spot - mean) * sumQty;
        } else {
          gain96 = sumTotal;
        }
      }
      let gain99 = 0;
      if (checked99.length > 0) {
        const sumTotal = checked99.reduce((s, i) => s + i.totalPrice, 0);
        const sumQty = sumSignedQty(checked99);
        if (sumQty !== 0) {
          const mean = Math.abs(sumTotal / (sumQty * 65.6));
          const spot = sumQty > 0 ? goldPrices.gold99_buy : goldPrices.gold99_sell;
          gain99 = Math.round((spot - mean) * sumQty * 65.6 * 100) / 100;
        } else {
          gain99 = sumTotal;
        }
      }
      const combined = gain96 + gain99;
      const f = fmtTruncColored(combined, 2);
      gainLossText = f.text;
      gainLossCls = f.cls;
    }

    return {
      qty96,
      qty99,
      qty96Cls,
      qty99Cls,
      mean96Text,
      mean99Text,
      totalText,
      totalCls,
      unrText,
      unrCls,
      gainLossText,
      gainLossCls,
    };
  }, [items96, items99, committedSelection, goldPrices]);

  function handleSearch() {
    setAppliedFilters(filters);
    loadActiveTickets();
  }

  async function handleCalculate() {
    try {
      const data = await goldService.getLatest();
      setGoldPrices({
        gold99_buy: data.gold99_buy,
        gold99_sell: data.gold99_sell,
        gold96_buy: data.gold96_buy,
        gold96_sell: data.gold96_sell,
        updateTime: data.created_at,
      });
    } catch {}
    setCommittedSelection(new Set(selectedIds));
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAllOnSection(rows: ActiveTicketItem[]) {
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
                    <SelectValue placeholder="ทั้งหมด" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ทั้งหมด</SelectItem>
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
                className="w-full lg:w-auto bg-[#1959A3] hover:bg-[#144a8a]"
                onClick={handleSearch}>
                ค้นหา
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* CALCULATE CARD */}
        <Card className="rounded-xl">
          <CardContent>
            <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:justify-between">
              <div className="grid grid-cols-2 lg:flex lg:flex-wrap gap-2 md:gap-3 flex-1">
                <StatCard
                  label="QTY 96.50"
                  value={stats.qty96}
                  valueClass={stats.qty96Cls}
                  subValue={stats.mean96Text}
                />
                <StatCard
                  label="QTY 99.99"
                  value={stats.qty99}
                  valueClass={stats.qty99Cls}
                  subValue={stats.mean99Text}
                />
                <StatCard label="Total" value={stats.totalText} valueClass={stats.totalCls} />
                <StatCard
                  label="Unrealize P/L"
                  value={stats.unrText}
                  valueClass={stats.unrCls}
                />
                <StatCard
                  label="Gain/Loss"
                  value={stats.gainLossText}
                  valueClass={stats.gainLossCls}
                />
              </div>
              <Button
                className="bg-[#1959A3] hover:bg-[#144a8a] w-full lg:w-auto"
                onClick={handleCalculate}>
                คำนวน
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* TICKET 96.50% */}
        <TicketSection
          title="Ticket 96.50%"
          loading={loading}
          items={items96}
          goldPrices={goldPrices}
          headerBuy={goldPrices?.gold96_buy}
          headerSell={goldPrices?.gold96_sell}
          updateTime={goldPrices?.updateTime}
          selectedIds={selectedIds}
          committedSelection={committedSelection}
          onToggleSelect={toggleSelect}
          onSelectAllOnSection={() => selectAllOnSection(items96)}
          onOpen={openTicket}
          qtyMaxDecimals={5}
        />

        {/* TICKET 99.99% */}
        <TicketSection
          title="Ticket 99.99%"
          loading={loading}
          items={items99}
          goldPrices={goldPrices}
          headerBuy={goldPrices?.gold99_buy}
          headerSell={goldPrices?.gold99_sell}
          updateTime={goldPrices?.updateTime}
          selectedIds={selectedIds}
          committedSelection={committedSelection}
          onToggleSelect={toggleSelect}
          onSelectAllOnSection={() => selectAllOnSection(items99)}
          onOpen={openTicket}
          qtyMaxDecimals={9}
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
  subValue,
}: {
  label: string;
  value: string;
  valueClass?: string;
  subValue?: string;
}) {
  return (
    <div className="bg-gray-50 rounded-xl px-3 md:px-4 py-2 md:py-3 min-w-0 lg:min-w-[150px]">
      <div className="flex items-baseline justify-between gap-2 text-[11px] md:text-xs text-gray-500 leading-tight">
        <span>{label}</span>
        {subValue && <span>({subValue})</span>}
      </div>
      <div
        className={`font-semibold text-base md:text-lg lg:text-xl mt-0.5 md:mt-1 truncate text-right ${valueClass}`}>
        {value}
      </div>
    </div>
  );
}

function TicketSection({
  title,
  loading,
  items,
  goldPrices,
  headerBuy,
  headerSell,
  updateTime,
  selectedIds,
  committedSelection,
  onToggleSelect,
  onSelectAllOnSection,
  onOpen,
  qtyMaxDecimals,
}: {
  title: string;
  loading: boolean;
  items: ActiveTicketItem[];
  goldPrices: GoldPrices | null;
  headerBuy?: number;
  headerSell?: number;
  updateTime?: string;
  selectedIds: Set<string>;
  committedSelection: Set<string>;
  onToggleSelect: (id: string) => void;
  onSelectAllOnSection: () => void;
  onOpen: (item: ActiveTicketItem) => void;
  qtyMaxDecimals: number;
}) {
  const [expanded, setExpanded] = useState(true);
  const [sort, setSort] = useState<SortState>(NO_SORT);

  function handleSort(key: string) {
    setSort((s) => nextSortState(s, key));
  }

  function getSortKey(item: ActiveTicketItem, key: string): string | number {
    switch (key) {
      case "createDate":
        return new Date(item.createDate).getTime();
      case "ticketType":
        return item.ticketType;
      case "command":
        return item.command;
      case "quantity":
        return item.quantity;
      case "pricePerUnit":
        return item.pricePerUnit;
      case "totalPrice":
        return item.totalPrice;
      case "unrealize":
        return unrealizeOf(item, goldPrices) ?? 0;
      case "dueDate":
        return new Date(getDueDate(item)).getTime();
      default:
        return "";
    }
  }

  const sortedItems = useMemo(
    () => sortItems(items, sort, getSortKey),
    // getSortKey closes over goldPrices, so re-sort when those change too.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items, sort, goldPrices]
  );

  const allSelected =
    items.length > 0 && items.every((i) => selectedIds.has(i.ticketCode));

  // Pull HH:mm:ss out of "YYYY-MM-DD HH:mm:ss.sss" (or any string that contains it).
  const timeMatch = updateTime?.match(/(\d{2}):(\d{2}):(\d{2})/);
  const timeText = timeMatch
    ? `${timeMatch[1]}:${timeMatch[2]}:${timeMatch[3]}`
    : null;
  const priceLine =
    timeText !== null && headerBuy !== undefined && headerSell !== undefined ? (
      <>
        ราคา ณ เวลา {timeText} น.:{" "}
        <span className="font-bold text-black">
          {fmtNumber(headerBuy)} / {fmtNumber(headerSell)}
        </span>
      </>
    ) : null;

  return (
    <Card className="rounded-xl">
      {/* HEADER (clickable) */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between gap-3 px-4 md:px-5 text-left"
        aria-expanded={expanded}>
        <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-base md:text-lg font-semibold">{title}</h2>
            <span className="text-sm text-gray-500">
              ({items.length} รายการ)
            </span>
          </div>
          {priceLine && (
            <span className="text-xs text-gray-500 whitespace-nowrap">
              {priceLine}
            </span>
          )}
        </div>
        <ChevronDown
          className={`w-5 h-5 text-gray-500 transition-transform shrink-0 ${
            expanded ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* TABLE */}
      {expanded && (
        <div className="px-4 md:px-5">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    checked={allSelected}
                    onChange={onSelectAllOnSection}
                    aria-label="Select all rows in this section"
                  />
                </TableHead>
                <SortableHead columnKey="createDate" state={sort} onSort={handleSort}>
                  วันที่/เวลา
                </SortableHead>
                <SortableHead
                  columnKey="ticketType"
                  state={sort}
                  onSort={handleSort}
                  className="hidden md:table-cell">
                  BY
                </SortableHead>
                <SortableHead columnKey="command" state={sort} onSort={handleSort}>
                  คำสั่ง
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
                  align="right"
                  className="hidden md:table-cell">
                  TOTAL
                </SortableHead>
                <SortableHead
                  columnKey="unrealize"
                  state={sort}
                  onSort={handleSort}
                  align="right"
                  className="hidden md:table-cell">
                  UNREALIZE
                </SortableHead>
                <SortableHead
                  columnKey="dueDate"
                  state={sort}
                  onSort={handleSort}
                  align="center"
                  className="hidden md:table-cell">
                  วันครบดีล
                </SortableHead>
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
              {!loading && items.length === 0 && (
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
                sortedItems.map((item) => {
                  const isSelected = selectedIds.has(item.ticketCode);
                  const isCommitted = committedSelection.has(item.ticketCode);
                  const u = unrealizeOf(item, goldPrices);
                  let uFormatted: { text: string; cls: string };
                  if (isCommitted) {
                    // Committed rows zero out in the display until the user
                    // unticks and presses คำนวน again.
                    uFormatted = { text: "0", cls: "" };
                  } else if (u === null) {
                    uFormatted = { text: "—", cls: "" };
                  } else {
                    uFormatted = fmtTruncColored(u);
                  }
                  return (
                    <TableRow
                      key={item.ticketCode}
                      className="cursor-pointer hover:bg-gray-50 transition"
                      onClick={() => onOpen(item)}>
                      <TableCell>
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
                          className={`inline-block min-w-[3rem] text-center px-2 py-1 text-xs rounded-full ${
                            item.command === 2
                              ? "bg-green-100 text-green-600"
                              : "bg-red-100 text-red-500"
                          }`}>
                          {commandLabel(item.command)}
                        </span>
                      </TableCell>
                      <TableCell
                        className={`text-right tabular-nums ${
                          item.quantity < 0 ? "text-red-500" : ""
                        }`}>
                        {fmtPlainSigned(item.quantity, qtyMaxDecimals)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {fmtNumber(item.pricePerUnit)}
                      </TableCell>
                      <TableCell
                        className={`hidden md:table-cell text-right tabular-nums ${
                          item.totalPrice < 0 ? "text-red-500" : ""
                        }`}>
                        {fmtTruncSigned(item.totalPrice)}
                      </TableCell>
                      <TableCell
                        className={`hidden md:table-cell text-right tabular-nums ${uFormatted.cls}`}>
                        {uFormatted.text}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-center">
                        {fmtDate(getDueDate(item))}
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </div>
      )}
    </Card>
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
    u === null ? { text: "—", cls: "" } : fmtTruncColored(u);

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
              value={`${fmtPlainSigned(
                item.quantity,
                qtyDecimalsForAsset(item.asset)
              )} ${qtyTypeLabel(item.quantityTypeText)}`}
              valueClass={item.quantity < 0 ? "text-red-500" : ""}
            />
            <Row label="ราคา" value={fmtNumber(item.pricePerUnit)} />
            <Row
              label="Total"
              value={fmtTruncSigned(item.totalPrice)}
              valueClass={item.totalPrice < 0 ? "text-red-500" : ""}
            />
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
