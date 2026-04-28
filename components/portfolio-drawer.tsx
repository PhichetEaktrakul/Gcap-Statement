"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: any;
};

export default function PortfolioDrawer({ open, onOpenChange, data }: Props) {
  if (!data) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[400px] p-0">
        <div className="bg-white h-full flex flex-col">
          {/* HEADER */}
          <SheetHeader className="p-4 border-b">
            <SheetTitle>{data.ticket}</SheetTitle>
          </SheetHeader>

          {/* CONTENT */}
          <div className="p-4 space-y-3 text-sm">
            <Row label="Ticket" value={data.ticket} />
            <Row label="วันที่/เวลา" value={data.datetime} />
            <Row label="ช่องทาง" value={data.channel} />
            <Row label="คำสั่ง" value={data.type} />
            <Row label="ทรัพย์สิน" value={data.asset} />
            <Row label="จำนวน" value={data.qty} />
            <Row label="ราคา" value={data.price} />
            <Row label="Total" value={data.total} />

            <Row
              label="Unrealize P/L"
              value={data.pl}
              valueClass={data.pl > 0 ? "text-green-600" : "text-red-500"}
            />

            <Row label="วันครบดีล" value={data.expire} />
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
    <div className="flex justify-between border-b pb-2">
      <span className="text-gray-500">{label}</span>
      <span className={valueClass}>{value}</span>
    </div>
  );
}
