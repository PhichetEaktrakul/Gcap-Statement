"use client";

import { useId, useState } from "react";
import { ScrollText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

const TERMS_TITLE =
  "เงื่อนไขและข้อตกลงการใช้งานเว็บไซต์ตรวจสอบรายการซื้อขายทองคำ";

const TERMS_SECTIONS: {
  title: string;
  body?: string;
  bullets?: string[];
}[] = [
  {
    title: "1. วัตถุประสงค์ของระบบ",
    body: "เว็บไซต์นี้จัดทำขึ้นเพื่ออำนวยความสะดวกให้ลูกค้าสามารถตรวจสอบข้อมูลเบื้องต้นเกี่ยวกับบัญชีซื้อขายทองคำของตนเอง ได้แก่",
    bullets: [
      "ยอดทองคำและเงินสดคงเหลือที่ฝากไว้กับบริษัท",
      "รายการซื้อขายที่รอการชำระราคา (Portfolio)",
      "รายการตั้งราคาซื้อขายล่วงหน้า (Leave Order)",
      "ประวัติรายการที่ดำเนินการชำระเงินเสร็จสิ้นแล้ว (History)",
    ],
  },
  {
    title: "2. ลักษณะของข้อมูลที่แสดง",
    body: "ข้อมูลที่แสดงบนเว็บไซต์นี้เป็นข้อมูลเบื้องต้นเพื่อการอ้างอิงเท่านั้น ไม่ถือเป็นเอกสารยืนยันสถานะบัญชีหรือรายการซื้อขายอย่างเป็นทางการ ข้อมูลดังกล่าวอาจมีความคลาดเคลื่อน ล่าช้า หรือไม่ตรงกับข้อมูลจริง อันเนื่องมาจาก:",
    bullets: [
      "ความผิดพลาดทางเทคนิคของระบบ",
      "ความล่าช้าในการประมวลผลหรือการอัปเดตข้อมูล",
      "ข้อผิดพลาดในการนำเข้าหรือแสดงผลข้อมูล",
      "เหตุสุดวิสัยหรือปัจจัยอื่นนอกเหนือการควบคุม",
    ],
  },
  {
    title: "3. ราคาและการคำนวณมูลค่า",
    body: "ราคาทองคำที่ใช้ในการคำนวณมูลค่าตลาด (Mark to Market) รวมถึงการแสดงกำไร/ขาดทุน (Gain/Loss) และกำไร/ขาดทุนที่ยังไม่รับรู้ (Unrealized Profit/Loss) เป็นเพียงการประมาณการเบื้องต้น เพื่อให้ลูกค้าใช้ประกอบการตัดสินใจเท่านั้น ตัวเลขดังกล่าว:",
    bullets: [
      "ไม่ถือเป็นราคาซื้อขายจริงหรือราคาที่บริษัทรับประกัน",
      "อาจแตกต่างจากราคาที่ใช้ในการชำระราคาจริง",
      "ไม่สามารถนำมาอ้างอิงเพื่อเรียกร้องสิทธิใด ๆ จากบริษัท",
    ],
  },
  {
    title: "4. ข้อมูลที่ถือเป็นหลักฐานอย่างเป็นทางการ",
    body: "ข้อมูลที่ถือเป็นหลักฐานอย่างเป็นทางการและมีผลผูกพันทางกฎหมาย ได้แก่ ข้อมูลในระบบฐานข้อมูลหลักของบริษัทเท่านั้น หากมีความแตกต่างระหว่างข้อมูลที่แสดงบนเว็บไซต์กับข้อมูลในระบบฐานข้อมูลหลักของบริษัท ให้ยึดถือข้อมูลในระบบฐานข้อมูลหลักเป็นสำคัญ",
  },
  {
    title: "5. การตรวจสอบความถูกต้อง",
    body: "ลูกค้ามีหน้าที่ตรวจสอบความถูกต้องของข้อมูลที่แสดงบนเว็บไซต์ด้วยตนเอง หากพบข้อมูลที่ไม่ถูกต้องหรือมีข้อสงสัย ลูกค้าสามารถติดต่อพนักงานของบริษัทเพื่อยืนยันข้อมูลที่ถูกต้องได้ทันที",
  },
  {
    title: "6. ข้อจำกัดความรับผิด",
    body: "บริษัทจะไม่รับผิดชอบต่อความเสียหายใด ๆ ที่เกิดขึ้นจาก:",
    bullets: [
      "การตัดสินใจของลูกค้าโดยอาศัยข้อมูลที่แสดงบนเว็บไซต์นี้",
      "ความผิดพลาด ความล่าช้า หรือความไม่สมบูรณ์ของข้อมูลที่แสดง",
      "การหยุดชะงักหรือขัดข้องของระบบ",
      "การเข้าถึงโดยไม่ได้รับอนุญาตหรือการละเมิดความปลอดภัยของข้อมูล",
    ],
  },
  {
    title: "7. การสละสิทธิ์ในการโต้แย้ง",
    body: "โดยการกดยอมรับเงื่อนไขนี้ ลูกค้าตกลงว่าจะไม่นำข้อมูลที่แสดงบนเว็บไซต์มาเป็นหลักฐานหรือข้ออ้างในการโต้แย้ง เรียกร้อง ฟ้องร้อง หรือดำเนินการใด ๆ ต่อบริษัท เว้นแต่ข้อมูลดังกล่าวจะตรงกับข้อมูลในระบบฐานข้อมูลหลักของบริษัท",
  },
  {
    title: "8. ความปลอดภัยของบัญชี",
    body: "ลูกค้ามีหน้าที่รักษาความลับของชื่อผู้ใช้และรหัสผ่าน และรับผิดชอบต่อการใช้งานทั้งหมดที่เกิดขึ้นภายใต้บัญชีของตน บริษัทจะไม่รับผิดชอบต่อความเสียหายอันเกิดจากการเข้าถึงบัญชีโดยบุคคลที่สาม",
  },
  {
    title: "9. การแก้ไขเงื่อนไข",
    body: "บริษัทขอสงวนสิทธิ์ในการแก้ไข เปลี่ยนแปลง หรือปรับปรุงเงื่อนไขการใช้งานนี้ได้ตลอดเวลา โดยไม่ต้องแจ้งให้ทราบล่วงหน้า การใช้งานเว็บไซต์ต่อไปหลังจากมีการเปลี่ยนแปลง ถือว่าลูกค้ายอมรับเงื่อนไขที่แก้ไขแล้ว",
  },
];

export default function TermsAgreementDialog({
  open,
  onOpenChange,
  loading = false,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loading?: boolean;
  onConfirm: () => void;
}) {
  const checkboxId = useId();
  const [accepted, setAccepted] = useState(false);

  function handleOpenChange(next: boolean) {
    if (!next) setAccepted(false);
    onOpenChange(next);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent showCloseButton={!loading}>
        <DialogHeader className="items-center gap-3">
          <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ScrollText className="size-7" />
          </div>
          <DialogTitle>ยืนยันข้อตกลงการใช้งาน</DialogTitle>
        </DialogHeader>

        {/* Scrollable agreement text */}
        <div className="max-h-[60vh] space-y-4 overflow-y-auto rounded-lg border border-border bg-muted/40 p-4 text-left text-sm leading-relaxed text-muted-foreground">
          <h3 className="text-sm font-semibold text-foreground">
            {TERMS_TITLE}
          </h3>
          {TERMS_SECTIONS.map((section) => (
            <section key={section.title} className="space-y-1">
              <h4 className="font-medium text-foreground">{section.title}</h4>
              {section.body && <p>{section.body}</p>}
              {section.bullets && (
                <ul className="list-disc space-y-0.5 pl-5">
                  {section.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>

        <label
          htmlFor={checkboxId}
          className="flex items-center gap-2 text-sm text-foreground select-none">
          <Checkbox
            id={checkboxId}
            checked={accepted}
            onCheckedChange={(v) => setAccepted(v === true)}
            disabled={loading}
          />
          ยอมรับเงื่อนไขการใช้งาน
        </label>

        <Button
          className="w-full"
          size="lg"
          disabled={!accepted || loading}
          onClick={onConfirm}>
          {loading ? "กำลังเข้าสู่ระบบ..." : "ถัดไป"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
