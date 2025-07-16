export type ErrorResponse<T> = {
  status: number;
  error: string;
  message: T;
  timestamp?: string;
  path?: string;
};
