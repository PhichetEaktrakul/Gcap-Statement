import Topbar from "@/components/topbar";
import { Card, CardContent } from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <>
      <Topbar />

      <div className="p-6 space-y-6">
        {/* TITLE */}
        <h1 className="text-xl font-semibold">หลักประกัน</h1>

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="rounded-xl">
            <CardContent className="p-5">
              <div className="text-sm text-gray-500">เงินฝาก</div>
              <div className="text-2xl font-bold mt-2">200,000 THB</div>
            </CardContent>
          </Card>

          <Card className="rounded-xl">
            <CardContent className="p-5">
              <div className="text-sm text-gray-500">ทองฝาก GOLD 96.50%</div>
              <div className="text-2xl font-bold mt-2">80 BAHT</div>
            </CardContent>
          </Card>

          <Card className="rounded-xl">
            <CardContent className="p-5">
              <div className="text-sm text-gray-500">ทองฝาก GOLD 99.99%</div>
              <div className="text-2xl font-bold mt-2">3 KG</div>
            </CardContent>
          </Card>
        </div>

        {/* TABLE */}
        <Card className="rounded-xl">
          <CardContent className="p-5">
            <div className="grid grid-cols-3 text-sm text-gray-500 pb-3 border-b">
              <div>Margin Cover</div>
              <div className="text-center text-green-600">ปริมาณซื้อ</div>
              <div className="text-center text-red-500">ปริมาณขาย</div>
            </div>

            <div className="grid grid-cols-3 py-4 border-b text-sm">
              <div className="text-blue-600">99.99%</div>
              <div className="text-center">49 KG</div>
              <div className="text-center">49 KG</div>
            </div>

            <div className="grid grid-cols-3 py-4 text-sm">
              <div className="text-blue-600">96.50%</div>
              <div className="text-center">3,385 BAHT</div>
              <div className="text-center">3,435 BAHT</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
