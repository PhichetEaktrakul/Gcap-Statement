export type ApiStatus = "success" | "error";

export type ApiResponse<T> = {
  status: ApiStatus;
  data: T;
  message?: string;
};

export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

export type PaginationParams = {
  page?: number;
  pageSize?: number;
};

export type DateRangeParams = {
  startDate?: string;
  endDate?: string;
};

export type OrderType = "buy" | "sell";
export type AssetType = "96.50" | "99.99";
export type Channel = "L" | "C";
