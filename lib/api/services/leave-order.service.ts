import { apiClient } from "../client";
import { ENDPOINTS } from "../endpoints";
import type {
  ApiResponse,
  AssetType,
  DateRangeParams,
  OrderType,
  Paginated,
  PaginationParams,
} from "../types";

export type LeaveOrderStatus = "waiting" | "complete" | "cancel";

export type LeaveOrderItem = {
  id: string;
  datetime: string;
  type: OrderType;
  asset: AssetType;
  qty: number;
  price: number;
  status: LeaveOrderStatus;
};

export type LeaveOrderListParams = PaginationParams &
  DateRangeParams & {
    asset?: AssetType | "all";
    type?: OrderType | "all";
    status?: LeaveOrderStatus | "all";
  };

export type CreateLeaveOrderPayload = {
  type: OrderType;
  asset: AssetType;
  qty: number;
  price: number;
};

export const leaveOrderService = {
  list: (params?: LeaveOrderListParams) =>
    apiClient
      .get<ApiResponse<Paginated<LeaveOrderItem>>>(ENDPOINTS.leaveOrder.list, {
        params,
      })
      .then((r) => r.data),

  create: (payload: CreateLeaveOrderPayload) =>
    apiClient
      .post<ApiResponse<LeaveOrderItem>>(ENDPOINTS.leaveOrder.create, payload)
      .then((r) => r.data),

  cancel: (id: string) =>
    apiClient
      .post<ApiResponse<LeaveOrderItem>>(ENDPOINTS.leaveOrder.cancel(id))
      .then((r) => r.data),
};
