"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";

import PortfolioDrawer from "@/components/portfolio-drawer";
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

export default function PortfolioPage() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const rowData = {
    ticket: "TK690311-0075",
    datetime: "05 เม.ย. 2569 12:30",
    channel: "Call (C)",
    type: "ลูกค้าขาย",
    asset: "Gold 99.99%",
    qty: "-1 KG",
    price: "59,280.00",
    total: "59,280.00",
    pl: 120,
    expire: "12/04/69",
  };
  return (
    <>
      <div className="p-4 md:p-6 space-y-4 md:space-y-6">
        {/* TITLE */}
        <div className="flex justify-between items-center gap-3">
          <h1 className="text-lg md:text-xl font-semibold">Portfolio</h1>
          <div className="bg-green-100 text-green-600 text-xs md:text-sm px-3 py-1 rounded-full whitespace-nowrap">
            6 รายการ
          </div>
        </div>

        {/* FILTER CARD */}
        <Card className="rounded-xl">
          <CardContent className="p-4 md:p-5 space-y-4">
            <div className="flex flex-col lg:flex-row lg:flex-wrap gap-3 md:gap-4 lg:items-center">
              {/* Asset */}
              <div className="flex items-center gap-2">
                <span className="text-sm shrink-0">Asset:</span>
                <Select>
                  <SelectTrigger className="w-full lg:w-[120px]">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="96">96.50%</SelectItem>
                    <SelectItem value="99">99.99%</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Type */}
              <div className="flex items-center gap-2">
                <span className="text-sm shrink-0">คำสั่ง:</span>
                <Select>
                  <SelectTrigger className="w-full lg:w-[120px]">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="buy">ซื้อ</SelectItem>
                    <SelectItem value="sell">ขาย</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <span className="text-sm shrink-0">วันครบดีล:</span>
                <div className="flex items-center gap-2">
                  <Input type="date" className="w-full sm:w-[150px]" />
                  <span className="text-sm">ถึง</span>
                  <Input type="date" className="w-full sm:w-[150px]" />
                </div>
              </div>

              {/* Search */}
              <Button className="w-full lg:w-auto bg-blue-600 hover:bg-blue-700">
                ค้นหา
              </Button>
            </div>

            {/* Summary */}
            <div className="text-xs md:text-sm text-gray-500 flex flex-wrap gap-x-4 md:gap-x-6 gap-y-1">
              <span>QTY 96.50 : -</span>
              <span>QTY 99.99 : -</span>
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
                {/* ROW */}
                <TableRow
                  onClick={() => {
                    setSelected(rowData);
                    setOpen(true);
                  }}
                  className="cursor-pointer hover:bg-gray-50 transition">
                  <TableCell>07/04/69 00:07</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-600 rounded-full">
                      L
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-600 rounded-full">
                      ซื้อ
                    </span>
                  </TableCell>
                  <TableCell>96.50%</TableCell>
                  <TableCell>10</TableCell>
                  <TableCell>57,150</TableCell>
                  <TableCell>571,500</TableCell>
                  <TableCell className="text-red-500">-650.00</TableCell>
                  <TableCell>14/04/69</TableCell>
                </TableRow>

                {/* duplicate rows as needed */}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      <PortfolioDrawer open={open} onOpenChange={setOpen} data={selected} />
    </>
  );
}
