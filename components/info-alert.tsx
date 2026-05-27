"use client";

import { AlertCircle } from "lucide-react";

export default function InfoAlert() {
  return (
    <div className="mt-4 rounded-lg border-2 border-dashed border-[#c7ae86] bg-[#fffaf2] p-3 text-center text-xs leading-relaxed">
      <AlertCircle className="inline-block w-4 h-4 mr-1 -mt-0.5 text-[#c7ae86]" />
      ใช้สำหรับดูข้อมูลรายการคงค้างของลูกค้าที่ทำรายการผ่านโทรศัพท์เท่านั้น
      ไม่สามารถใช้ซื้อขายทองคำออนไลน์ได้
    </div>
  );
}
