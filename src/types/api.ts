export type ApiErrorResponse = {
  detail: string | { msg: string; type: string }[];
};

export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

export type ApiResponse<T> = {
  success?: boolean;
  data: T;
  message?: string;
};
