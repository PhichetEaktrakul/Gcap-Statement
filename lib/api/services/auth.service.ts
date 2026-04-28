import { apiClient } from "../client";
import { ENDPOINTS } from "../endpoints";
import type { ApiResponse } from "../types";

export type LoginPayload = {
  phone: string;
};

export type LoginResponse = {
  refId: string;
  expiresAt: string;
};

export type VerifyOtpPayload = {
  refId: string;
  code: string;
};

export type AuthUser = {
  customerId: string;
  name: string;
  phone: string;
  bankName?: string;
  bankAccount?: string;
};

export type VerifyOtpResponse = {
  accessToken: string;
  user: AuthUser;
};

export const authService = {
  login: (payload: LoginPayload) =>
    apiClient
      .post<ApiResponse<LoginResponse>>(ENDPOINTS.auth.login, payload)
      .then((r) => r.data),

  verifyOtp: (payload: VerifyOtpPayload) =>
    apiClient
      .post<ApiResponse<VerifyOtpResponse>>(ENDPOINTS.auth.verifyOtp, payload)
      .then((r) => r.data),

  logout: () =>
    apiClient
      .post<ApiResponse<null>>(ENDPOINTS.auth.logout)
      .then((r) => r.data),

  me: () =>
    apiClient
      .get<ApiResponse<AuthUser>>(ENDPOINTS.auth.me)
      .then((r) => r.data),
};
