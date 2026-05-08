"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { authService } from "@/lib/api/services/auth.service";
import { registrationStorage } from "@/lib/api/auth-storage";
import { Step1Form, Step2Form, Step3Form } from "@/components/auth-steps";
import { isPasswordStrong } from "@/components/password-strength";

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

  const [regCode, setRegCode] = useState("");
  const [regPhone, setRegPhone] = useState("");
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

  async function handleStep1() {
    if (!regCode || !regPhone) return;
    setStep1Loading(true);
    try {
      const res = await authService.forgotPassword({
        code: regCode,
        phoneNumber: regPhone,
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
    if (newPassword !== confirmPassword) {
      toast.error("รหัสผ่านไม่ตรงกัน");
      return;
    }
    if (!isPasswordStrong(newPassword)) {
      toast.error("รหัสผ่านไม่ผ่านมาตราฐานความปลอดภัย");
      return;
    }
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
    <div className="p-4 md:p-6 flex items-start justify-center">
      <Card className="w-full max-w-md rounded-2xl shadow-sm">
        <CardContent className="p-6 md:p-8">
          <h1 className="text-base md:text-lg font-semibold text-center mb-6">
            เปลี่ยนรหัสผ่าน
          </h1>

          {step === 1 && (
            <Step1Form
              regCode={regCode}
              setRegCode={setRegCode}
              regPhone={regPhone}
              setRegPhone={setRegPhone}
              loading={step1Loading}
              onConfirm={handleStep1}
              onCancel={handleCancel}
            />
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
  );
}
