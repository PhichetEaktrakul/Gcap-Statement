import { apiClient } from "../client";
import { ENDPOINTS } from "../endpoints";
import type { ApiResponse } from "../types";

export type BankAccount = {
  bankName: string | null;
  accountName: string | null;
  maskedAccountNumber: string | null;
  accountType: string | null;
  bankBranch: string | null;
};

export type CustomerProfile = {
  customerId: number | null;
  customerCode: string | null;
  firstName: string | null;
  lastName: string | null;
  company: string | null;
  cardNumber: string | null;
  mobileNumber: string | null;
  email: string | null;
  tradeType: string | null;
  bankAccount: BankAccount | null;
};

export type CustomerAssets = {
  cashAmount: number;
  gold999: number;
  gold965: number;
};

export type CustomerMarginCover = {
  canBuy9999: number;
  canBuy9650: number;
  canSell9999: number;
  canSell9650: number;
};

export const customerService = {
  getProfile: () =>
    apiClient
      .get<ApiResponse<CustomerProfile>>(ENDPOINTS.gcalltrade.customer.profile)
      .then((r) => r.data),

  getAssets: () =>
    apiClient
      .get<ApiResponse<CustomerAssets>>(ENDPOINTS.gcalltrade.customer.assets)
      .then((r) => r.data),

  getMarginCover: () =>
    apiClient
      .get<ApiResponse<CustomerMarginCover>>(ENDPOINTS.gcalltrade.customer.marginCover)
      .then((r) => r.data),
};
