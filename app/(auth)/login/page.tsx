"use client";

import { useState } from "react";
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

export default function AuthPage() {
  const [tab, setTab] = useState("login");
  const [step, setStep] = useState(1);

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
              <form className="space-y-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" />
                </div>

                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input type="password" />
                </div>

                <Button className="w-full">Sign in</Button>
              </form>
            </TabsContent>

            {/* ================= REGISTER ================= */}
            <TabsContent value="register">
              {/* STEP 1: PHONE */}
              {step === 1 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <Input placeholder="08xxxxxxxx" />
                  </div>

                  <div className="space-y-2">
                    <Label>Verification Code</Label>
                    <Input placeholder="Enter code" />
                  </div>

                  <Button className="w-full" onClick={() => setStep(2)}>
                    Confirm
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
                    <InputOTP maxLength={6}>
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

                  <Button className="w-full" onClick={() => setStep(3)}>
                    Confirm
                  </Button>
                </div>
              )}

              {/* STEP 3: PASSWORD */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Password</Label>
                    <Input type="password" />
                  </div>

                  <div className="space-y-2">
                    <Label>Confirm Password</Label>
                    <Input type="password" />
                  </div>

                  <Button
                    className="w-full"
                    onClick={() => {
                      setStep(1);
                      setTab("login");
                    }}>
                    Create account
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
