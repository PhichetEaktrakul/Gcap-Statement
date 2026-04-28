import { apiClient } from "../client";
import { ENDPOINTS } from "../endpoints";
import type {
  ApiResponse,
  AssetType,
  Channel,
  DateRangeParams,
  OrderType,
  Paginated,
  PaginationParams,
} from "../types";

export type HistoryItem = {
  ticket: string;
  datetime: string;
  channel: Channel;
  type: OrderType;
  asset: AssetType;
  qty: number;
  price: number;
  total: number;
};

export type HistoryListParams = PaginationParams &
  DateRangeParams & {
    search?: string;
    asset?: AssetType | "all";
    type?: OrderType | "all";
  };

export const historyService = {
  list: (params?: HistoryListParams) =>
    apiClient
      .get<ApiResponse<Paginated<HistoryItem>>>(ENDPOINTS.history.list, {
        params,
      })
      .then((r) => r.data),
};
