"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { customerService, type CustomerProfile } from "@/lib/api/services/customer.service";
import { authService } from "@/lib/api/services/auth.service";
import { refreshAccessToken, setAccessToken } from "@/lib/api/client";

export default function ProfilePopover() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [loadedOnce, setLoadedOnce] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let cancelled = false;
    customerService
      .getProfile()
      .then((res) => {
        if (!cancelled) setProfile(res.data);
      })
      .catch(() => {
        // Silently fail on mount; the popover will still render with em-dashes.
      })
      .finally(() => {
        if (!cancelled) setLoadedOnce(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      let res: Awaited<ReturnType<typeof authService.logout>> | undefined;
      try {
        res = await authService.logout();
      } catch (err) {
        const status = (err as { response?: { status?: number } })?.response
          ?.status;
        if (status !== 401) throw err;
        // Token expired — refresh once and retry.
        try {
          await refreshAccessToken();
          res = await authService.logout();
        } catch {
          setAccessToken(null);
          setOpen(false);
          router.replace("/login");
          return;
        }
      }
      setAccessToken(null);
      setOpen(false);
      toast.success(res?.message || "ออกจากระบบสำเร็จ");
      router.replace("/login");
    } catch (err) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(
        e?.response?.data?.message ?? "ออกจากระบบไม่สำเร็จ"
      );
    } finally {
      setLoggingOut(false);
    }
  }

  const fullName =
    profile && (profile.firstName || profile.lastName)
      ? `${profile.firstName} ${profile.lastName}`.trim()
      : null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="px-3 py-1.5 rounded-lg bg-[#c7ae86]/15 text-[#ffdfab] text-sm font-semibold transition-opacity hover:opacity-90 min-w-[64px] text-center cursor-pointer"
          aria-label="Open profile menu">
          {profile?.customerCode ?? (loadedOnce ? "—" : "...")}
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={10}
        className="w-[320px] p-0 rounded-xl overflow-hidden">
        <div className="bg-white text-black">
          {/* HEADER */}
          <div className="p-4">
            <div className="font-semibold">{fullName ?? "—"}</div>
            <div className="text-sm text-gray-500">
              รหัสลูกค้า: {profile?.customerCode ?? "—"}
            </div>
          </div>

          <Separator />

          {/* CUSTOMER INFO */}
          <div className="p-4 space-y-3 text-sm">
            <div className="text-xs font-semibold text-gray-500 tracking-wide">
              ข้อมูลลูกค้า
            </div>
            <Row label="เบอร์โทรศัพท์" value={profile?.mobileNumber} />
          </div>

          <Separator />

          {/* BANK ACCOUNT */}
          <div className="p-4 space-y-3 text-sm">
            <div className="text-xs font-semibold text-gray-500 tracking-wide">
              บัญชีธนาคาร
            </div>
            <Row label="ธนาคาร" value={profile?.bankAccount.bankName} />
            <Row label="สาขา" value={profile?.bankAccount.bankBranch} />
            <Row label="ชื่อบัญชี" value={profile?.bankAccount.accountName} />
            <Row
              label="เลขที่บัญชี"
              value={profile?.bankAccount.maskedAccountNumber}
            />
            <Row
              label="ประเภทบัญชี"
              value={profile?.bankAccount.accountType}
            />
          </div>

          <Separator />

          {/* ACTION */}
          <div className="p-4 space-y-2">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setOpen(false);
                router.push("/change-password");
              }}>
              เปลี่ยนรหัสผ่าน
            </Button>
            <Button
              variant="destructive"
              className="w-full"
              onClick={handleLogout}
              disabled={loggingOut}>
              {loggingOut ? "กำลังออกจากระบบ..." : "ออกจากระบบ"}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function Row({ label, value }: { label: string; value?: string | null }) {
  const display = value && value.trim() ? value : "—";
  return (
    <div className="flex justify-between gap-3">
      <span className="text-gray-500 shrink-0">{label}</span>
      <span className="text-right break-all">{display}</span>
    </div>
  );
}
