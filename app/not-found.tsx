import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#f5f7fb] text-center">
      <FileQuestion className="w-32 h-32 text-gray-300" strokeWidth={1.25} />
      <div className="text-6xl md:text-7xl font-bold text-gray-300 mt-2">404</div>
      <h1 className="text-xl md:text-2xl font-semibold text-gray-700 mt-4">Not Found</h1>
      <p className="text-sm text-gray-500 mt-2 max-w-sm">ไม่พบหน้าที่คุณกำลังค้นหา หรือลิงก์อาจถูกย้ายไปแล้ว</p>
      <Link href="/dashboard" className="mt-6">
        <Button className="bg-[#1959A3] hover:bg-[#144a8a]">กลับสู่หน้าแรก</Button>
      </Link>
    </div>
  );
}
