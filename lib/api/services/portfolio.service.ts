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

export type PortfolioItem = {
  ticket: string;
  datetime: string;
  channel: Channel;
  type: OrderType;
  asset: AssetType;
  qty: number;
  price: number;
  total: number;
  unrealizePL: number;
  expire: string;
};

export type PortfolioListParams = PaginationParams &
  DateRangeParams & {
    asset?: AssetType | "all";
    type?: OrderType | "all";
  };

export type PortfolioSummary = {
  qty96: number;
  qty99: number;
  total: number;
  unrealizePL: number;
};

export const portfolioService = {
  list: (params?: PortfolioListParams) =>
    apiClient
      .get<ApiResponse<Paginated<PortfolioItem> & { summary: PortfolioSummary }>>(
        ENDPOINTS.portfolio.list,
        { params }
      )
      .then((r) => r.data),

  detail: (ticket: string) =>
    apiClient
      .get<ApiResponse<PortfolioItem>>(ENDPOINTS.portfolio.detail(ticket))
      .then((r) => r.data),
};
