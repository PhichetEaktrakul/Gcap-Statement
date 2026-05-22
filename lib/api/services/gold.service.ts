import { priceClient } from "../client";
import { ENDPOINTS } from "../endpoints";
import type { ApiResponse } from "../types";

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
  getLatest: () =>
    priceClient
      .get<ApiResponse<GoldLatest>>(ENDPOINTS.gold.latest)
      .then((r) => r.data.data),
};
