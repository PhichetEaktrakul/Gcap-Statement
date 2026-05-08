"use client";

import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import PasswordStrength from "@/components/password-strength";

export function CancelLink({
  onClick,
  label = "ยกเลิก",
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
        {loading ? "กำลังตรวจสอบ..." : "Confirm"}
      </Button>

      {onCancel && <CancelLink onClick={onCancel} />}
    </div>
  );
}

export function Step3Form({
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  loading,
  submitLabel,
  onConfirm,
  onCancel,
}: {
  newPassword: string;
  setNewPassword: (v: string) => void;
  confirmPassword: string;
  setConfirmPassword: (v: string) => void;
  loading: boolean;
  submitLabel: string;
  onConfirm: () => void;
  onCancel?: () => void;
}) {
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
