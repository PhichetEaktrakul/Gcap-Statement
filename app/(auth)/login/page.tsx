"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { authService } from "@/lib/api/services/auth.service";
import { getAccessToken, setAccessToken } from "@/lib/api/client";
import { registrationStorage } from "@/lib/api/auth-storage";
import { getErrorMessage } from "@/lib/api/errors";
import { Step1Form, Step2Form, Step3Form } from "@/components/auth-steps";
import TermsAgreementDialog from "@/components/terms-agreement-dialog";
import Gcaplogo from "@/assets/logo_gcapgold.png";
import Image from "next/image";
import InfoAlert from "@/components/info-alert";

type View = "login" | "register" | "forgot";

export default function AuthPage() {
  const router = useRouter();
  const [view, setView] = useState<View>("login");
  const [step, setStep] = useState(1);

  const [loginCode, setLoginCode] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);

  const [regCode, setRegCode] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [step1Loading, setStep1Loading] = useState(false);

  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);

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

  function handleLogin(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!loginCode || !loginPassword) return;
    // Require the user to accept the terms before logging in.
    setTermsOpen(true);
  }

  async function confirmLogin() {
    setLoginLoading(true);
    try {
      const res = await authService.login({
        code: loginCode,
        password: loginPassword,
      });
      setAccessToken(res.data.token);
      setTermsOpen(false);
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
        stage2Token,
      );
      toast.success(
        view === "forgot" ? "เปลี่ยนรหัสผ่านสำเร็จ" : "สร้างผู้ใช้งานสำเร็จ",
      );
      backToLogin();
    } catch (err) {
      toast.error(getErrorMessage(err, "ดำเนินการไม่สำเร็จ"));
    } finally {
      setSetPwLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-tl from-[#0a3a8c] via-[#052460] to-[#021539] p-4">
      <Card className="w-full max-w-md rounded-2xl shadow-2xl bg-white backdrop-blur">
        <CardContent className="p-8">
          {/* LOGO HEADER */}
          <div className="flex flex-col items-center gap-2 mb-6">
            <div className="bg-white rounded-xl p-2 ring-1 ring-gray-200 shadow-sm mb-3">
              <Image src={Gcaplogo} alt="GCAP Logo" className="size-18" />
            </div>
            <div className="text-md uppercase tracking-widest text-gray-700 font-bold text-center">
              ระบบตรวจสอบรายการคงค้าง
              <br />
              สำหรับการซื้อขายทางโทรศัพท์
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
                  code={regCode}
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

              {/* LOGIN */}
              <TabsContent value="login">
                <form className="space-y-4" onSubmit={handleLogin}>
                  <div className="space-y-2">
                    <Label>Customer Code</Label>
                    <Input
                      type="text"
                      autoComplete="username"
                      placeholder="Enter your code"
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
                      placeholder="Enter your password"
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
                  <InfoAlert />
                </form>
              </TabsContent>

              {/* REGISTER */}
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
                    code={regCode}
                    newPassword={newPassword}
                    setNewPassword={setNewPassword}
                    confirmPassword={confirmPassword}
                    setConfirmPassword={setConfirmPassword}
                    loading={setPwLoading}
                    submitLabel="Create account"
                    onConfirm={handleSetPassword}
                  />
                )}
                <InfoAlert />
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>

      <TermsAgreementDialog
        open={termsOpen}
        onOpenChange={(o) => {
          if (!loginLoading) setTermsOpen(o);
        }}
        loading={loginLoading}
        onConfirm={confirmLogin}
      />
    </div>
  );
}
