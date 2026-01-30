/**
 * Async route handler wrapper
 * Automatically catches errors and passes them to error middleware
 */
export const asyncHandler =
  (fn: (...args: any[]) => Promise<void>) =>
  (...args: any[]) => {
    Promise.resolve(fn(...args)).catch(args[args.length - 1]); // last arg is next()
  };

/**
 * Create response type for API endpoints
 */
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: unknown;
}
