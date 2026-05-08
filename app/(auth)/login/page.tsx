"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { authService } from "@/lib/api/services/auth.service";
import { getAccessToken, setAccessToken } from "@/lib/api/client";
import { registrationStorage } from "@/lib/api/auth-storage";

type View = "login" | "register" | "forgot";

const PASSWORD_CHECKS: { label: string; test: (p: string) => boolean }[] = [
  { label: "อย่างน้อย 8 ตัวอักษร", test: (p) => p.length >= 8 },
  { label: "มีตัวอักษรพิมพ์ใหญ่ (A–Z)", test: (p) => /[A-Z]/.test(p) },
  { label: "มีตัวอักษรพิมพ์เล็ก (a–z)", test: (p) => /[a-z]/.test(p) },
  { label: "มีตัวเลข (0–9)", test: (p) => /[0-9]/.test(p) },
  { label: "มีอักขระพิเศษ (เช่น ! @ # $)", test: (p) => /[^A-Za-z0-9]/.test(p) },
];

function isPasswordStrong(p: string): boolean {
  return PASSWORD_CHECKS.every((c) => c.test(p));
}

function getErrorMessage(err: unknown, fallback: string): string {
  const e = err as {
    response?: { data?: { message?: string } };
    message?: string;
  };
  return e?.response?.data?.message ?? e?.message ?? fallback;
}

export default function AuthPage() {
  const router = useRouter();
  const [view, setView] = useState<View>("login");
  const [step, setStep] = useState(1);

  // Login form
  const [loginCode, setLoginCode] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Step 1 fields (shared between Register and Forgot)
  const [regCode, setRegCode] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [step1Loading, setStep1Loading] = useState(false);

  // Step 2 (OTP)
  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);

  // Step 3 (password)
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [setPwLoading, setSetPwLoading] = useState(false);

  useEffect(() => {
    if (getAccessToken()) {
      router.replace("/dashboard");
    }
  }, [router]);

  function resetFlowState() {
    setRegCode("");
    setRegPhone("");
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
    setStep(1);
    registrationStorage.clear();
  }

  function backToLogin() {
    resetFlowState();
    setView("login");
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!loginCode || !loginPassword) return;
    setLoginLoading(true);
    try {
      const res = await authService.login({
        code: loginCode,
        password: loginPassword,
      });
      setAccessToken(res.data.token);
      toast.success("เข้าสู่ระบบสำเร็จ");
      router.push("/dashboard");
    } catch (err) {
      toast.error(getErrorMessage(err, "เข้าสู่ระบบไม่สำเร็จ"));
    } finally {
      setLoginLoading(false);
    }
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
      toast.error("ไม่พบข้อมูลการสมัคร กรุณาเริ่มใหม่");
      resetFlowState();
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
      resetFlowState();
      return;
    }
    setSetPwLoading(true);
    try {
      await authService.setPassword(
        { newPassword, confirmPassword },
        stage2Token
      );
      toast.success(
        view === "forgot" ? "เปลี่ยนรหัสผ่านสำเร็จ" : "สร้างผู้ใช้งานสำเร็จ"
      );
      backToLogin();
    } catch (err) {
      toast.error(getErrorMessage(err, "ดำเนินการไม่สำเร็จ"));
    } finally {
      setSetPwLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#153DA3] to-[#23E8AD] p-4">
      <Card className="w-full max-w-md rounded-2xl shadow-2xl bg-white backdrop-blur">
        <CardContent className="p-8">
          {/* LOGO HEADER */}
          <div className="flex flex-col items-center gap-2 mb-6">
            <div className="bg-white rounded-xl p-2 ring-1 ring-gray-200 shadow-sm">
              <img
                src="/gcap-logo.png"
                alt="GCAP"
                className="h-16 w-16 object-contain"
              />
            </div>
            <div className="text-xs uppercase tracking-[0.2em] text-gray-500 font-medium">
              statement
            </div>
          </div>

          {view === "forgot" ? (
            <div>
              <h2 className="text-base font-semibold text-center mb-4">
                Forgot Password
              </h2>

              {step === 1 && (
                <Step1Form
                  regCode={regCode}
                  setRegCode={setRegCode}
                  regPhone={regPhone}
                  setRegPhone={setRegPhone}
                  loading={step1Loading}
                  onConfirm={handleStep1}
                  onCancel={backToLogin}
                />
              )}
              {step === 2 && (
                <Step2Form
                  otp={otp}
                  setOtp={setOtp}
                  loading={otpLoading}
                  onConfirm={handleVerifyOtp}
                  onCancel={backToLogin}
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
                  onCancel={backToLogin}
                />
              )}
            </div>
          ) : (
            <Tabs
              value={view}
              onValueChange={(v) => {
                setView(v as View);
                setStep(1);
              }}
              className="w-full">
              <TabsList className="grid grid-cols-2 mb-6 bg-muted p-1 rounded-lg">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>

              {/* ================= LOGIN ================= */}
              <TabsContent value="login">
                <form className="space-y-4" onSubmit={handleLogin}>
                  <div className="space-y-2">
                    <Label>Code</Label>
                    <Input
                      type="text"
                      autoComplete="username"
                      value={loginCode}
                      onChange={(e) => setLoginCode(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Password</Label>
                    <Input
                      type="password"
                      autoComplete="current-password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                    />
                  </div>

                  <Button
                    className="w-full"
                    type="submit"
                    disabled={loginLoading}>
                    {loginLoading ? "กำลังเข้าสู่ระบบ..." : "Sign in"}
                  </Button>

                  <button
                    type="button"
                    onClick={() => {
                      setView("forgot");
                      setStep(1);
                    }}
                    className="block mx-auto text-xs text-gray-600 underline hover:text-gray-900 mt-2">
                    Forgot Password
                  </button>
                </form>
              </TabsContent>

              {/* ================= REGISTER ================= */}
              <TabsContent value="register">
                {step === 1 && (
                  <Step1Form
                    regCode={regCode}
                    setRegCode={setRegCode}
                    regPhone={regPhone}
                    setRegPhone={setRegPhone}
                    loading={step1Loading}
                    onConfirm={handleStep1}
                  />
                )}
                {step === 2 && (
                  <Step2Form
                    otp={otp}
                    setOtp={setOtp}
                    loading={otpLoading}
                    onConfirm={handleVerifyOtp}
                  />
                )}
                {step === 3 && (
                  <Step3Form
                    newPassword={newPassword}
                    setNewPassword={setNewPassword}
                    confirmPassword={confirmPassword}
                    setConfirmPassword={setConfirmPassword}
                    loading={setPwLoading}
                    submitLabel="Create account"
                    onConfirm={handleSetPassword}
                  />
                )}
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ----- step components -----

type Step1Props = {
  regCode: string;
  setRegCode: (v: string) => void;
  regPhone: string;
  setRegPhone: (v: string) => void;
  loading: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
};

function Step1Form({
  regCode,
  setRegCode,
  regPhone,
  setRegPhone,
  loading,
  onConfirm,
  onCancel,
}: Step1Props) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Code</Label>
        <Input
          type="text"
          placeholder="Enter your code"
          value={regCode}
          onChange={(e) => setRegCode(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Phone Number</Label>
        <Input
          type="tel"
          placeholder="08xxxxxxxx"
          value={regPhone}
          onChange={(e) => setRegPhone(e.target.value)}
        />
      </div>

      <Button
        className="w-full"
        onClick={onConfirm}
        disabled={loading || !regCode || !regPhone}>
        {loading ? "กำลังส่ง..." : "Confirm"}
      </Button>

      {onCancel && <CancelLink onClick={onCancel} />}
    </div>
  );
}

type Step2Props = {
  otp: string;
  setOtp: (v: string) => void;
  loading: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
};

function Step2Form({ otp, setOtp, loading, onConfirm, onCancel }: Step2Props) {
  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600 text-center">
        A One-Time Password (OTP) has been sent to your registered phone
        number. Please enter the 6-digit code below to verify your identity.
        The code will expire shortly.
      </div>

      <div className="flex justify-center">
        <InputOTP maxLength={6} value={otp} onChange={setOtp}>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
      </div>

      <Button
        className="w-full"
        onClick={onConfirm}
        disabled={loading || otp.length < 6}>
        {loading ? "กำลังตรวจสอบ..." : "Confirm"}
      </Button>

      {onCancel && <CancelLink onClick={onCancel} />}
    </div>
  );
}

type Step3Props = {
  newPassword: string;
  setNewPassword: (v: string) => void;
  confirmPassword: string;
  setConfirmPassword: (v: string) => void;
  loading: boolean;
  submitLabel: string;
  onConfirm: () => void;
  onCancel?: () => void;
};

function Step3Form({
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  loading,
  submitLabel,
  onConfirm,
  onCancel,
}: Step3Props) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Password</Label>
        <Input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Confirm Password</Label>
        <Input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </div>

      <PasswordStrength password={newPassword} />

      <Button
        className="w-full"
        onClick={onConfirm}
        disabled={loading || !newPassword || !confirmPassword}>
        {loading ? "กำลังดำเนินการ..." : submitLabel}
      </Button>

      {onCancel && <CancelLink onClick={onCancel} />}
    </div>
  );
}

function CancelLink({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="block mx-auto text-xs text-gray-600 underline hover:text-gray-900">
      ยกเลิก
    </button>
  );
}

function PasswordStrength({ password }: { password: string }) {
  const checks = PASSWORD_CHECKS.map((c) => ({
    label: c.label,
    ok: c.test(password),
  }));
  const score = checks.filter((c) => c.ok).length;
  const total = checks.length;

  function segColor(idx: number): string {
    if (idx >= score) return "bg-gray-200";
    if (score <= 2) return "bg-red-500";
    if (score <= 3) return "bg-yellow-500";
    if (score <= 4) return "bg-blue-500";
    return "bg-green-500";
  }

  return (
    <div className="space-y-1.5">
      <div className="flex gap-1">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={`flex-1 h-1 rounded-full transition-colors ${segColor(i)}`}
          />
        ))}
      </div>
      <ul className="text-xs space-y-0.5">
        {checks.map((c, i) => (
          <li key={i} className={c.ok ? "text-green-600" : "text-gray-500"}>
            <span className="inline-block w-3">{c.ok ? "✓" : "•"}</span>{" "}
            {c.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
