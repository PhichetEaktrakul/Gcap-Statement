import { apiClient } from "../client";
import { ENDPOINTS } from "../endpoints";
import type { ApiResponse } from "../types";

export type TicketChannel = "C" | "L";
export type TicketCommand = 1 | 2; // 1 = sell, 2 = buy
export type TicketAsset = 1 | 2;   // 1 = 9999, 2 = 9650
export type QuantityType = "kg" | "baht";

export type TicketHistoryItem = {
  createDate: string;
  ticketType: TicketChannel;
  ticketCode: string;
  orderTypeText: string;
  command: TicketCommand;
  asset: TicketAsset;
  assetPurity: string;
  quantity: number;
  quantityTypeText: QuantityType;
  pricePerUnit: number;
  totalPrice: number;
  ticketBy: string;
};

export type TicketHistoryPage = {
  items: TicketHistoryItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type TicketHistoryParams = {
  Page?: number;
  PageSize?: number;
  SearchTerm?: string;
  "Filter.Command"?: TicketCommand;
  "Filter.AssetId"?: TicketAsset;
  "Filter.DateFrom"?: string;
  "Filter.DateTo"?: string;
};

export type LeaveOrderStatusText =
  | "complete"
  | "cancelled"
  | "pending"
  | "other"
  | string;

export type LeaveOrderItem = {
  leaveCode: string;
  createDate: string;
  command: TicketCommand;
  orderTypeText: string;
  asset: TicketAsset;
  assetTypeText: string;
  quantity: number;
  quantityTypeText: QuantityType;
  pricePerUnit: number;
  leaveStatus: number;
  statusText: LeaveOrderStatusText;
  // ISO timestamp the order was completed or cancelled — absent while pending.
  actionDate?: string;
};

export type LeaveOrderPage = {
  items: LeaveOrderItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

// 1 = Complete, 2 = Cancelled, 3 = Waiting
export type LeaveStatusCode = 1 | 2 | 3;

export type LeaveOrderParams = {
  Page?: number;
  PageSize?: number;
  SearchTerm?: string;
  "Filter.Command"?: TicketCommand;
  "Filter.AssetId"?: TicketAsset;
  "Filter.LeaveStatus"?: LeaveStatusCode;
  "Filter.DateFrom"?: string;
  "Filter.DateTo"?: string;
};

export type ActiveTicketItem = TicketHistoryItem & {
  dueDate?: string;
};

export const tradeService = {
  getTicketHistory: (params: TicketHistoryParams) =>
    apiClient
      .get<ApiResponse<TicketHistoryPage>>(
        ENDPOINTS.gcalltrade.trade.ticketsHistory,
        { params }
      )
      .then((r) => r.data),

  getActiveTickets: () =>
    apiClient
      .get<ApiResponse<ActiveTicketItem[]>>(
        ENDPOINTS.gcalltrade.trade.ticketsActive
      )
      .then((r) => r.data),

  getLeaveOrders: (params?: LeaveOrderParams) =>
    apiClient
      .get<ApiResponse<LeaveOrderPage>>(
        ENDPOINTS.gcalltrade.trade.leaveOrders,
        { params }
      )
      .then((r) => r.data),
};
