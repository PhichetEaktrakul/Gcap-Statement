"use client";

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

export default function LeaveOrderPage() {
  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* TITLE */}
      <h1 className="text-lg md:text-xl font-semibold">Leave Order</h1>

      {/* FILTER */}
      <Card className="rounded-xl">
        <CardContent className="p-4 md:p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap gap-3 md:gap-4 lg:items-center">
            <Select>
              <SelectTrigger className="w-full lg:w-[160px]">
                <SelectValue placeholder="ทุกทรัพย์สิน" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุกทรัพย์สิน</SelectItem>
                <SelectItem value="96">96.50%</SelectItem>
                <SelectItem value="99">99.99%</SelectItem>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger className="w-full lg:w-[140px]">
                <SelectValue placeholder="ทุกคำสั่ง" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุกคำสั่ง</SelectItem>
                <SelectItem value="buy">ซื้อ</SelectItem>
                <SelectItem value="sell">ขาย</SelectItem>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger className="w-full lg:w-[140px]">
                <SelectValue placeholder="ทุกสถานะ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุกสถานะ</SelectItem>
                <SelectItem value="waiting">Waiting</SelectItem>
                <SelectItem value="complete">Complete</SelectItem>
                <SelectItem value="cancel">Cancel</SelectItem>
              </SelectContent>
            </Select>

            <Input type="date" className="w-full lg:w-[150px]" />
            <Input type="date" className="w-full lg:w-[150px]" />

            <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700">
              ค้นหา
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* TABLE */}
      <Card className="rounded-xl">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>วันที่</TableHead>
                <TableHead>คำสั่ง</TableHead>
                <TableHead>ทรัพย์สิน</TableHead>
                <TableHead>จำนวน</TableHead>
                <TableHead>ราคาตั้ง</TableHead>
                <TableHead>สถานะ</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {/* ROW 1 */}
              <TableRow>
                <TableCell>06/04/69 14:20</TableCell>
                <TableCell>
                  <span className="px-2 py-1 text-xs bg-green-100 text-green-600 rounded-full">
                    ซื้อ
                  </span>
                </TableCell>
                <TableCell>96.50%</TableCell>
                <TableCell>5</TableCell>
                <TableCell>76,000</TableCell>
                <TableCell>
                  <span className="px-3 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full">
                    Waiting
                  </span>
                </TableCell>
              </TableRow>

              {/* ROW 2 */}
              <TableRow>
                <TableCell>05/04/69 09:00</TableCell>
                <TableCell>
                  <span className="px-2 py-1 text-xs bg-red-100 text-red-500 rounded-full">
                    ขาย
                  </span>
                </TableCell>
                <TableCell>99.99%</TableCell>
                <TableCell>2</TableCell>
                <TableCell>80,000</TableCell>
                <TableCell>
                  <span className="px-3 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full">
                    Waiting
                  </span>
                </TableCell>
              </TableRow>

              {/* ROW 3 */}
              <TableRow>
                <TableCell>28/03/69 17:30</TableCell>
                <TableCell>
                  <span className="px-2 py-1 text-xs bg-red-100 text-red-500 rounded-full">
                    ขาย
                  </span>
                </TableCell>
                <TableCell>96.50%</TableCell>
                <TableCell>10</TableCell>
                <TableCell>79,500</TableCell>
                <TableCell>
                  <span className="px-3 py-1 text-xs bg-green-100 text-green-600 rounded-full">
                    Complete
                  </span>
                </TableCell>
              </TableRow>

              {/* ROW 4 */}
              <TableRow>
                <TableCell>23/03/69 00:24</TableCell>
                <TableCell>
                  <span className="px-2 py-1 text-xs bg-green-100 text-green-600 rounded-full">
                    ซื้อ
                  </span>
                </TableCell>
                <TableCell>96.50%</TableCell>
                <TableCell>5</TableCell>
                <TableCell>72,000</TableCell>
                <TableCell>
                  <span className="px-3 py-1 text-xs bg-green-100 text-green-600 rounded-full">
                    Complete
                  </span>
                </TableCell>
              </TableRow>

              {/* ROW 5 */}
              <TableRow>
                <TableCell>15/03/69 11:00</TableCell>
                <TableCell>
                  <span className="px-2 py-1 text-xs bg-green-100 text-green-600 rounded-full">
                    ซื้อ
                  </span>
                </TableCell>
                <TableCell>99.99%</TableCell>
                <TableCell>1</TableCell>
                <TableCell>79,000</TableCell>
                <TableCell>
                  <span className="px-3 py-1 text-xs bg-gray-200 text-gray-600 rounded-full">
                    Cancel
                  </span>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
