/**
 * Pagination Types
 */

export interface PaginationInput {
  limit?: number;
  cursor?: string;
}

export interface PaginationResult<T> {
  items: T[];
  nextCursor?: string;
  hasMore: boolean;
}

export interface PaginationMeta {
  total?: number;
  limit: number;
  cursor?: string;
}
