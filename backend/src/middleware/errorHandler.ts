import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/errors";

interface AuthRequest extends Request {
  userId?: string;
  email?: string;
  role?: string;
}

/**
 * Global error handling middleware
 * Should be the last middleware registered
 */
export const errorHandler = (
  error: unknown,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error("Error:", error);

  // Handle custom API errors
  if (error instanceof ApiError) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
      errors: error.errors,
    });
    return;
  }

  // Handle MongoDB validation errors
  if (error instanceof Error && error.name === "ValidationError") {
    res.status(400).json({
      success: false,
      message: "Validation error",
      errors: error.message,
    });
    return;
  }

  // Handle MongoDB cast errors
  if (error instanceof Error && error.name === "CastError") {
    res.status(400).json({
      success: false,
      message: "Invalid ID format",
    });
    return;
  }

  // Handle JWT errors
  if (error instanceof Error && error.name === "JsonWebTokenError") {
    res.status(401).json({
      success: false,
      message: "Invalid token",
    });
    return;
  }

  if (error instanceof Error && error.name === "TokenExpiredError") {
    res.status(401).json({
      success: false,
      message: "Token expired",
    });
    return;
  }

  // Default error response
  res.status(500).json({
    success: false,
    message: "Internal server error",
    ...(process.env.NODE_ENV === "development" && {
      error: error instanceof Error ? error.message : String(error),
    }),
  });
};

/**
 * 404 Not Found middleware
 * Should be registered before error handler
 */
export const notFound = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
  });
};
