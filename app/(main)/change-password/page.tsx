"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { authService } from "@/lib/api/services/auth.service";
import { customerService } from "@/lib/api/services/customer.service";
import { registrationStorage } from "@/lib/api/auth-storage";
import { Step2Form, Step3Form, CancelLink } from "@/components/auth-steps";

function getErrorMessage(err: unknown, fallback: string): string {
  const e = err as {
    response?: { data?: { message?: string } };
    message?: string;
  };
  return e?.response?.data?.message ?? e?.message ?? fallback;
}

export default function ChangePasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [customerCode, setCustomerCode] = useState("");

  const [step1Loading, setStep1Loading] = useState(false);

  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [setPwLoading, setSetPwLoading] = useState(false);

  function handleCancel() {
    registrationStorage.clear();
    router.push("/dashboard");
  }

  async function handleStartChange() {
    setStep1Loading(true);
    try {
      const profile = await customerService.getProfile();
      const code = profile.data.customerCode;
      const phone = (profile.data.mobileNumber || "").replace(/\D/g, "");
      if (!code || !phone) {
        toast.error("ไม่พบข้อมูลลูกค้า ไม่สามารถเปลี่ยนรหัสผ่านได้");
        return;
      }
      setCustomerCode(code);
      const res = await authService.forgotPassword({
        code,
        phoneNumber: phone,
      });
      registrationStorage.setStage1Token(res.data.stage1Token);
      registrationStorage.setRefCode(res.data.refCode);
      toast.success(`ส่งรหัส OTP แล้ว (Ref: ${res.data.refCode})`);
      setStep(2);
    } catch (err) {
      toast.error(getErrorMessage(err, "ส่งคำขอไม่สำเร็จ"));
    } finally {
      setStep1Loading(false);
    }
  }

  async function handleVerifyOtp() {
    const stage1Token = registrationStorage.getStage1Token();
    const refCode = registrationStorage.getRefCode();
    if (!stage1Token || !refCode) {
      toast.error("ไม่พบข้อมูลการเปลี่ยนรหัส กรุณาเริ่มใหม่");
      setStep(1);
      return;
    }
    setOtpLoading(true);
    try {
      const res = await authService.verifyOtp({ otp, refCode }, stage1Token);
      registrationStorage.setStage2Token(res.data.stage2Token);
      toast.success("ยืนยัน OTP สำเร็จ");
      setStep(3);
    } catch (err) {
      toast.error(getErrorMessage(err, "OTP ไม่ถูกต้อง"));
    } finally {
      setOtpLoading(false);
    }
  }

  async function handleSetPassword() {
    if (!newPassword || !confirmPassword) return;
    const stage2Token = registrationStorage.getStage2Token();
    if (!stage2Token) {
      toast.error("เซสชันหมดอายุ กรุณาเริ่มใหม่");
      setStep(1);
      return;
    }
    setSetPwLoading(true);
    try {
      await authService.setPassword(
        { newPassword, confirmPassword },
        stage2Token
      );
      registrationStorage.clear();
      toast.success("เปลี่ยนรหัสผ่านสำเร็จ");
      router.push("/dashboard");
    } catch (err) {
      toast.error(getErrorMessage(err, "ดำเนินการไม่สำเร็จ"));
    } finally {
      setSetPwLoading(false);
    }
  }

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      <h1 className="text-lg md:text-xl font-semibold">เปลี่ยนรหัสผ่าน</h1>

      <div className="flex justify-center">
        <Card className="w-full max-w-md rounded-2xl shadow-sm">
          <CardContent className="p-6 md:p-8">
            {step === 1 && (
              <div className="space-y-6">
                <div className="text-base text-center font-medium">
                  ต้องการเปลี่ยนรหัสผ่านหรือไม่?
                </div>
                <div className="space-y-3">
                  <Button
                    className="w-full"
                    onClick={handleStartChange}
                    disabled={step1Loading}>
                    {step1Loading ? "กำลังส่ง..." : "Confirm"}
                  </Button>
                  <CancelLink onClick={handleCancel} />
                </div>
              </div>
            )}

            {step === 2 && (
              <Step2Form
                otp={otp}
                setOtp={setOtp}
                loading={otpLoading}
                onConfirm={handleVerifyOtp}
                onCancel={handleCancel}
              />
            )}

            {step === 3 && (
              <Step3Form
                code={customerCode}
                newPassword={newPassword}
                setNewPassword={setNewPassword}
                confirmPassword={confirmPassword}
                setConfirmPassword={setConfirmPassword}
                loading={setPwLoading}
                submitLabel="Change password"
                onConfirm={handleSetPassword}
                onCancel={handleCancel}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
