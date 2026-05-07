import { apiClient } from "../client";
import { ENDPOINTS } from "../endpoints";

export type GoldLatest = {
  id: number;
  gold99_buy: number;
  gold99_sell: number;
  old_gold99_buy: number;
  old_gold99_sell: number;
  gold96_buy: number;
  gold96_sell: number;
  old_gold96_buy: number;
  old_gold96_sell: number;
  created_at: string;
};

export const goldService = {
  // The gold endpoint is not wrapped in the standard ApiResponse envelope.
  getLatest: () =>
    apiClient.get<GoldLatest>(ENDPOINTS.gold.latest).then((r) => r.data),
};
