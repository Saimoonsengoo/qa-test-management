import { Request } from "express";

export interface PaginationParams {
  skip: number;
  take: number;
  page: number;
  limit: number;
}

// Reads ?page=&limit= from a request, applying sane defaults/caps.
// Convention documented in API Overview.md.
export function getPagination(req: Request): PaginationParams {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
  return { skip: (page - 1) * limit, take: limit, page, limit };
}

export function paginatedResponse<T>(
  data: T[],
  total: number,
  pagination: PaginationParams
) {
  return {
    success: true,
    data,
    page: pagination.page,
    limit: pagination.limit,
    total,
  };
}
