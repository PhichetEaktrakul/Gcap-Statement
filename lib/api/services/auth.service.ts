import { apiClient } from "../client";
import { ENDPOINTS } from "../endpoints";
import type { ApiResponse } from "../types";

export type LoginPayload = {
  code: string;
  password: string;
};

export type LoginResponse = {
  token: string;
};

export type ForgotPasswordPayload = {
  code: string;
  phoneNumber: string;
};

export type ForgotPasswordResponse = {
  stage1Token: string;
  refCode: string;
};

export type VerifyOtpPayload = {
  otp: string;
  refCode: string;
};

export type VerifyOtpResponse = {
  stage2Token: string;
  expiresInSeconds: number;
};

export type SetPasswordPayload = {
  newPassword: string;
  confirmPassword: string;
};

export type ValidatePasswordPayload = {
  code: string;
  password: string;
};

export type ValidatePasswordData = {
  isValid: boolean;
  score: number;
  errors: string[];
};

export const authService = {
  login: (payload: LoginPayload) =>
    apiClient
      .post<ApiResponse<LoginResponse>>(ENDPOINTS.auth.login, payload)
      .then((r) => r.data),

  forgotPassword: (payload: ForgotPasswordPayload) =>
    apiClient
      .post<ApiResponse<ForgotPasswordResponse>>(ENDPOINTS.auth.forgotPassword, payload)
      .then((r) => r.data),

  verifyOtp: (payload: VerifyOtpPayload, stage1Token: string) =>
    apiClient
      .post<ApiResponse<VerifyOtpResponse>>(ENDPOINTS.auth.verifyOtp, payload, {
        headers: { Authorization: `Bearer ${stage1Token}` },
      })
      .then((r) => r.data),

  setPassword: (payload: SetPasswordPayload, stage2Token: string) =>
    apiClient
      .post<ApiResponse<null>>(ENDPOINTS.auth.setPassword, payload, {
        headers: { Authorization: `Bearer ${stage2Token}` },
      })
      .then((r) => r.data),

  validatePassword: (payload: ValidatePasswordPayload) =>
    apiClient
      .post<ApiResponse<ValidatePasswordData>>(ENDPOINTS.auth.validatePassword, payload)
      .then((r) => r.data),

  logout: () =>
    apiClient
      .post<ApiResponse<null>>(ENDPOINTS.auth.logout)
      .then((r) => r.data),
};
