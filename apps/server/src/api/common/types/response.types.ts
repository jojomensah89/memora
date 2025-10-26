/**
 * Common Response Types
 */

export type SuccessResponse<T = unknown> = {
  success: true;
  data: T;
  message?: string;
};

export type ErrorResponse = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

export type ApiResponse<T = unknown> = SuccessResponse<T> | ErrorResponse;

export type StreamResponse = {
  stream: ReadableStream;
  headers: Record<string, string>;
};
