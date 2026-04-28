import { apiClient } from "../client";
import { ENDPOINTS } from "../endpoints";
import type { ApiResponse, AssetType } from "../types";

export type DashboardSummary = {
  cash: number;
  goldDeposit96: number;
  goldDeposit99: number;
};

export type MarginCoverRow = {
  asset: AssetType;
  buyAmount: number;
  sellAmount: number;
  unit: "BAHT" | "KG";
};

export const dashboardService = {
  getSummary: () =>
    apiClient
      .get<ApiResponse<DashboardSummary>>(ENDPOINTS.dashboard.summary)
      .then((r) => r.data),

  getMarginCover: () =>
    apiClient
      .get<ApiResponse<MarginCoverRow[]>>(ENDPOINTS.dashboard.marginCover)
      .then((r) => r.data),
};
