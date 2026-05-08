"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  customerService,
  type CustomerAssets,
  type CustomerMarginCover,
} from "@/lib/api/services/customer.service";

function fmt(value: number | undefined | null, maxFraction = 2): string {
  if (value === undefined || value === null) return "—";
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: maxFraction,
  });
}

function fmtGold(value: number | undefined | null): string {
  if (value === undefined || value === null) return "—";
  const isWhole = Number.isInteger(value);
  return value.toLocaleString("en-US", {
    minimumFractionDigits: isWhole ? 0 : 5,
    maximumFractionDigits: 5,
  });
}

export default function DashboardPage() {
  const [assets, setAssets] = useState<CustomerAssets | null>(null);
  const [margin, setMargin] = useState<CustomerMarginCover | null>(null);

  useEffect(() => {
    customerService
      .getAssets()
      .then((res) => setAssets(res.data))
      .catch(() => {});
    customerService
      .getMarginCover()
      .then((res) => setMargin(res.data))
      .catch(() => {});
  }, []);

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* TITLE */}
      <h1 className="text-lg md:text-xl font-semibold">หลักประกัน</h1>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        <Card className="rounded-xl">
          <CardContent className="p-4 md:p-5">
            <div className="text-sm text-gray-500">เงินฝาก</div>
            <div className="text-xl md:text-2xl font-bold mt-2 text-right">
              {fmt(assets?.cashAmount)} THB
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl">
          <CardContent className="p-4 md:p-5">
            <div className="text-sm text-gray-500">ทองฝาก GOLD 96.50%</div>
            <div className="text-xl md:text-2xl font-bold mt-2 text-right">
              {fmtGold(assets?.gold965)} BAHT
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl sm:col-span-2 lg:col-span-1">
          <CardContent className="p-4 md:p-5">
            <div className="text-sm text-gray-500">ทองฝาก GOLD 99.99%</div>
            <div className="text-xl md:text-2xl font-bold mt-2 text-right">
              {fmtGold(assets?.gold999)} KG
            </div>
          </CardContent>
        </Card>
      </div>

      {/* MARGIN COVER TABLE */}
      <Card className="rounded-xl">
        <CardContent className="p-4 md:p-5">
          <div className="grid grid-cols-3 text-xs md:text-sm text-gray-500 pb-3 border-b">
            <div>ปริมาณที่ซื้อ-ขายได้</div>
            <div className="text-center text-green-600">Buy</div>
            <div className="text-center text-red-500">Sell</div>
          </div>

          <div className="grid grid-cols-3 py-3 md:py-4 border-b text-xs md:text-sm">
            <div className="text-blue-600">99.99%</div>
            <div className="text-center">{fmt(margin?.canSell9999)} KG</div>
            <div className="text-center">{fmt(margin?.canBuy9999)} KG</div>
          </div>

          <div className="grid grid-cols-3 py-3 md:py-4 text-xs md:text-sm">
            <div className="text-blue-600">96.50%</div>
            <div className="text-center">{fmt(margin?.canSell9650)} BAHT</div>
            <div className="text-center">{fmt(margin?.canBuy9650)} BAHT</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
