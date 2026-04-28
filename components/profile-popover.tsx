"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function ProfilePopover() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="flex items-center gap-3 cursor-pointer">
          <div className="w-9 h-9 rounded-full bg-gradient-to-r from-[#153DA3] to-[#23E8AD] flex items-center justify-center text-white font-semibold">
            WM
          </div>

          <span className="text-sm text-gray-300">CA80555</span>
        </div>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={10} // 👈 move down
        className="w-[320px] p-0 rounded-xl overflow-hidden">
        <div className="bg-white text-black">
          {/* HEADER */}
          <div className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center">
              พพ
            </div>

            <div>
              <div className="font-semibold">ปวีดร test</div>
              <div className="text-sm text-gray-500">รหัสลูกค้า: CA80555</div>
            </div>
          </div>

          <Separator />

          {/* INFO */}
          <div className="p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">เบอร์โทรศัพท์</span>
              <span>084-147-3144</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">ธนาคาร</span>
              <span>ธนาคารกสิกรไทย</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">เลขบัญชี</span>
              <span>XXXXXX0471</span>
            </div>
          </div>

          <Separator />

          {/* ACTION */}
          <div className="p-4">
            <Button variant="destructive" className="w-full">
              ออกจากระบบ
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
