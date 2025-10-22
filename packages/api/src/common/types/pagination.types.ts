/**
 * Pagination Types
 */

export type PaginationInput = {
  limit?: number;
  cursor?: string;
};

export type PaginationResult<T> = {
  items: T[];
  nextCursor?: string;
  hasMore: boolean;
};

export type PaginationMeta = {
  total?: number;
  limit: number;
  cursor?: string;
};
