export type PaginationOptions = {
  page?: unknown;
  limit?: unknown;
};

import { env } from '../../config/env.config.js';

export const getPagination = ({ page, limit }: PaginationOptions) => {
  const pageNumber = Math.max(Number(page) || 1, 1);
  const pageSize = Math.min(Math.max(Number(limit) || env.defaultPageSize, 1), env.maxPageSize);

  const skip = (pageNumber - 1) * pageSize;

  return {
    page: pageNumber,
    limit: pageSize,
    skip,
  };
};
