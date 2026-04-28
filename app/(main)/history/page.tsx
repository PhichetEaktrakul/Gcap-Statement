"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Topbar from "@/components/topbar";
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

export default function HistoryPage() {
  return (
    <>    <Topbar />
    <div className="p-6 space-y-6">
      {/* TITLE */}
      <h1 className="text-xl font-semibold">History</h1>

      {/* FILTER */}
      <Card className="rounded-xl">
        <CardContent className="p-5 flex flex-wrap gap-4 items-center">
          {/* Search */}
          <Input placeholder="ค้นหา Ticket..." className="w-[220px]" />

          {/* Asset */}
          <Select>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="ทุกทรัพย์สิน" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ทุกทรัพย์สิน</SelectItem>
              <SelectItem value="96">96.50%</SelectItem>
              <SelectItem value="99">99.99%</SelectItem>
            </SelectContent>
          </Select>

          {/* Type */}
          <Select>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="ทุกคำสั่ง" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ทุกคำสั่ง</SelectItem>
              <SelectItem value="buy">ซื้อ</SelectItem>
              <SelectItem value="sell">ขาย</SelectItem>
            </SelectContent>
          </Select>

          {/* Date */}
          <Input type="date" className="w-[150px]" />
          <Input type="date" className="w-[150px]" />

          {/* Button */}
          <Button className="bg-blue-600 hover:bg-blue-700">ค้นหา</Button>
        </CardContent>
      </Card>

      {/* TABLE */}
      <Card className="rounded-xl">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>วันที่/เวลา</TableHead>
                <TableHead>ช่องทาง</TableHead>
                <TableHead>คำสั่ง</TableHead>
                <TableHead>ทรัพย์สิน</TableHead>
                <TableHead>จำนวน</TableHead>
                <TableHead>ราคา</TableHead>
                <TableHead>รวม</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {/* ROW 1 */}
              <TableRow>
                <TableCell>29/03/69 15:41</TableCell>
                <TableCell>
                  <span className="px-2 py-1 text-xs bg-green-100 text-green-600 rounded-full">
                    L
                  </span>
                </TableCell>
                <TableCell>
                  <span className="px-2 py-1 text-xs bg-red-100 text-red-500 rounded-full">
                    ขาย
                  </span>
                </TableCell>
                <TableCell>96.50%</TableCell>
                <TableCell>4.9</TableCell>
                <TableCell>78,605</TableCell>
                <TableCell>385,165</TableCell>
              </TableRow>

              {/* ROW 2 */}
              <TableRow>
                <TableCell>29/03/69 15:39</TableCell>
                <TableCell>
                  <span className="px-2 py-1 text-xs bg-green-100 text-green-600 rounded-full">
                    L
                  </span>
                </TableCell>
                <TableCell>
                  <span className="px-2 py-1 text-xs bg-red-100 text-red-500 rounded-full">
                    ขาย
                  </span>
                </TableCell>
                <TableCell>99.99%</TableCell>
                <TableCell>0.9</TableCell>
                <TableCell>81,600</TableCell>
                <TableCell>4,817,664</TableCell>
              </TableRow>

              {/* ROW 3 (highlight like screenshot) */}
              <TableRow className="bg-gray-50">
                <TableCell>28/03/69 23:03</TableCell>
                <TableCell>
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-500 rounded-full">
                    C
                  </span>
                </TableCell>
                <TableCell>
                  <span className="px-2 py-1 text-xs bg-red-100 text-red-500 rounded-full">
                    ขาย
                  </span>
                </TableCell>
                <TableCell>96.50%</TableCell>
                <TableCell>10</TableCell>
                <TableCell>78,300</TableCell>
                <TableCell>783,000</TableCell>
              </TableRow>

              {/* ROW 4 */}
              <TableRow>
                <TableCell>28/03/69 17:30</TableCell>
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
                <TableCell>5</TableCell>
                <TableCell>78,465</TableCell>
                <TableCell>392,325</TableCell>
              </TableRow>

              {/* ROW 5 */}
              <TableRow>
                <TableCell>23/03/69 00:57</TableCell>
                <TableCell>
                  <span className="px-2 py-1 text-xs bg-green-100 text-green-600 rounded-full">
                    L
                  </span>
                </TableCell>
                <TableCell>
                  <span className="px-2 py-1 text-xs bg-red-100 text-red-500 rounded-full">
                    ขาย
                  </span>
                </TableCell>
                <TableCell>96.50%</TableCell>
                <TableCell>5</TableCell>
                <TableCell>72,780</TableCell>
                <TableCell>363,900</TableCell>
              </TableRow>
            </TableBody>
          </Table>

          {/* PAGINATION */}
          <div className="flex justify-between items-center p-4 text-sm text-gray-500">
            <span>แสดง 1–5 จาก 118</span>

            <div className="flex items-center gap-2">
              <button className="px-2 py-1 border rounded">&lt;</button>
              <button className="px-3 py-1 bg-blue-600 text-white rounded">
                1
              </button>
              <button className="px-3 py-1 border rounded">2</button>
              <button className="px-2 py-1 border rounded">&gt;</button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
    </>

  );
}
