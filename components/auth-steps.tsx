"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import PasswordStrength from "@/components/password-strength";
import {
  authService,
  type ValidatePasswordData,
} from "@/lib/api/services/auth.service";

export function CancelLink({
  onClick,
  label = "Cancel",
}: {
  onClick: () => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="block mx-auto text-xs text-gray-600 underline hover:text-gray-900">
      {label}
    </button>
  );
}

export function Step1Form({
  regCode,
  setRegCode,
  regPhone,
  setRegPhone,
  loading,
  onConfirm,
  onCancel,
}: {
  regCode: string;
  setRegCode: (v: string) => void;
  regPhone: string;
  setRegPhone: (v: string) => void;
  loading: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Customer Code</Label>
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
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder="08xxxxxxxx"
          value={regPhone}
          onChange={(e) => setRegPhone(e.target.value.replace(/\D/g, ""))}
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

export function Step2Form({
  otp,
  setOtp,
  loading,
  onConfirm,
  onCancel,
}: {
  otp: string;
  setOtp: (v: string) => void;
  loading: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
}) {
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
        {loading ? "กำลังตรวจสอบ..." : "ถัดไป"}
      </Button>

      {onCancel && <CancelLink onClick={onCancel} />}
    </div>
  );
}

export function Step3Form({
  code,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  loading,
  submitLabel,
  onConfirm,
  onCancel,
}: {
  code: string;
  newPassword: string;
  setNewPassword: (v: string) => void;
  confirmPassword: string;
  setConfirmPassword: (v: string) => void;
  loading: boolean;
  submitLabel: string;
  onConfirm: () => void;
  onCancel?: () => void;
}) {
  const [validating, setValidating] = useState(false);
  const [result, setResult] = useState<ValidatePasswordData | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Run /auth/validate-password 2 seconds after the user stops typing.
  useEffect(() => {
    if (!newPassword) {
      setResult(null);
      setValidating(false);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setValidating(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await authService.validatePassword({
          code,
          password: newPassword,
        });
        setResult(res.data);
      } catch {
        setResult(null);
      } finally {
        setValidating(false);
      }
    }, 2000);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [newPassword, code]);

  async function handleSubmit() {
    if (!newPassword || !confirmPassword) return;
    if (newPassword !== confirmPassword) {
      toast.error("รหัสผ่านไม่ตรงกัน");
      return;
    }

    // If the user pressed confirm before the debounce fired, run validation
    // now to guarantee a fresh result, then act on it.
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setValidating(true);
    try {
      const res = await authService.validatePassword({
        code,
        password: newPassword,
      });
      setResult(res.data);
      if (!res.data.isValid || res.data.errors.length > 0) {
        toast.error("รหัสผ่านไม่ผ่านมาตราฐานความปลอดภัย");
        return;
      }
      onConfirm();
    } catch {
      toast.error("ไม่สามารถตรวจสอบรหัสผ่านได้");
    } finally {
      setValidating(false);
    }
  }

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

      <PasswordStrength
        score={result?.score ?? null}
        errors={result?.errors ?? null}
        isValid={result?.isValid ?? null}
        loading={validating}
        mismatch={
          newPassword.length > 0 &&
          confirmPassword.length > 0 &&
          newPassword !== confirmPassword
        }
      />

      <Button
        className="w-full"
        onClick={handleSubmit}
        disabled={
          loading ||
          validating ||
          !newPassword ||
          !confirmPassword ||
          newPassword !== confirmPassword
        }>
        {loading ? "กำลังดำเนินการ..." : submitLabel}
      </Button>

      {onCancel && <CancelLink onClick={onCancel} />}
    </div>
  );
}
