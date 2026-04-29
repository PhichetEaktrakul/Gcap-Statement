"use client";

import { useState } from "react";
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
import { setAccessToken } from "@/lib/api/client";
import { registrationStorage } from "@/lib/api/auth-storage";

function getErrorMessage(err: unknown, fallback: string): string {
  const e = err as {
    response?: { data?: { message?: string } };
    message?: string;
  };
  return e?.response?.data?.message ?? e?.message ?? fallback;
}

export default function AuthPage() {
  const router = useRouter();
  const [tab, setTab] = useState("login");
  const [step, setStep] = useState(1);

  // Login
  const [loginCode, setLoginCode] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Register step 1
  const [regCode, setRegCode] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [step1Loading, setStep1Loading] = useState(false);

  // Register step 2 (OTP)
  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);

  // Register step 3 (password)
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [setPwLoading, setSetPwLoading] = useState(false);

  function resetRegistrationState() {
    setRegCode("");
    setRegPhone("");
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
    setStep(1);
    registrationStorage.clear();
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
      // Save access token to both localStorage and a non-HttpOnly cookie.
      // The server's Set-Cookie for refresh_token is stored automatically
      // because the axios client sends withCredentials.
      setAccessToken(res.data.token);
      toast.success("เข้าสู่ระบบสำเร็จ");
      router.push("/dashboard");
    } catch (err) {
      toast.error(getErrorMessage(err, "เข้าสู่ระบบไม่สำเร็จ"));
    } finally {
      setLoginLoading(false);
    }
  }

  async function handleRegisterStep1() {
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
      resetRegistrationState();
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
    const stage2Token = registrationStorage.getStage2Token();
    if (!stage2Token) {
      toast.error("เซสชันหมดอายุ กรุณาเริ่มใหม่");
      resetRegistrationState();
      return;
    }
    setSetPwLoading(true);
    try {
      await authService.setPassword(
        { newPassword, confirmPassword },
        stage2Token
      );
      toast.success("สร้างผู้ใช้งานสำเร็จ");
      resetRegistrationState();
      setTab("login");
    } catch (err) {
      toast.error(getErrorMessage(err, "สร้างผู้ใช้งานไม่สำเร็จ"));
    } finally {
      setSetPwLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#153DA3] to-[#23E8AD] p-4">
      <Card className="w-full max-w-md rounded-2xl shadow-2xl bg-white backdrop-blur">
        <CardContent className="p-8">
          <Tabs value={tab} onValueChange={setTab} className="w-full">
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
              </form>
            </TabsContent>

            {/* ================= REGISTER ================= */}
            <TabsContent value="register">
              {/* STEP 1: CODE + PHONE */}
              {step === 1 && (
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
                    onClick={handleRegisterStep1}
                    disabled={step1Loading || !regCode || !regPhone}>
                    {step1Loading ? "กำลังส่ง..." : "Confirm"}
                  </Button>
                </div>
              )}

              {/* STEP 2: OTP */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="text-sm text-gray-600 text-center">
                    A One-Time Password (OTP) has been sent to your registered
                    phone number. Please enter the 6-digit code below to verify
                    your identity. The code will expire shortly.
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
                    onClick={handleVerifyOtp}
                    disabled={otpLoading || otp.length < 6}>
                    {otpLoading ? "กำลังตรวจสอบ..." : "Confirm"}
                  </Button>
                </div>
              )}

              {/* STEP 3: PASSWORD */}
              {step === 3 && (
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

                  <Button
                    className="w-full"
                    onClick={handleSetPassword}
                    disabled={
                      setPwLoading || !newPassword || !confirmPassword
                    }>
                    {setPwLoading ? "กำลังสร้างบัญชี..." : "Create account"}
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
