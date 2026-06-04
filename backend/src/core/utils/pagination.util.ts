export type PaginationOptions = {
  page?: unknown;
  limit?: unknown;
};

export const getPagination = ({ page, limit }: PaginationOptions) => {
  const pageNumber = Math.max(Number(page) || 1, 1);
  const pageSize = Math.min(Math.max(Number(limit) || 20, 1), 100);

  return {
    page: pageNumber,
    limit: pageSize,
    skip: (pageNumber - 1) * pageSize,
  };
};
