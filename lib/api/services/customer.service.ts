import { apiClient } from "../client";
import { ENDPOINTS } from "../endpoints";
import type { ApiResponse } from "../types";

export type BankAccount = {
  bankName: string;
  accountName: string;
  maskedAccountNumber: string;
  accountType: string;
  bankBranch: string;
};

export type CustomerProfile = {
  customerId: number;
  customerCode: string;
  firstName: string;
  lastName: string;
  company: string;
  cardNumber: string;
  mobileNumber: string;
  email: string;
  tradeType: string;
  bankAccount: BankAccount;
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
      .get<ApiResponse<CustomerMarginCover>>(
        ENDPOINTS.gcalltrade.customer.marginCover
      )
      .then((r) => r.data),
};
