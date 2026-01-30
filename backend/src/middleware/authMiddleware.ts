import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import { UnauthorizedError } from "../utils/errors";
import { Role } from "../models/User";

export interface AuthRequest extends Request {
  userId?: string;
  email?: string;
  role?: Role;
}

/**
 * Authentication middleware
 * Verifies JWT token and attaches user info to request
 */
export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const token = extractToken(req);

    if (!token) {
      throw new UnauthorizedError("No token provided");
    }

    const decoded = verifyToken(token);

    // Attach decoded token info to request
    req.userId = decoded.userId;
    req.email = decoded.email;
    req.role = decoded.role;

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Role-based access control middleware
 * Ensures user has required role
 */
export const authorize = (...allowedRoles: Role[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.userId) {
      next(new UnauthorizedError("Authentication required"));
      return;
    }

    if (!req.role || !allowedRoles.includes(req.role as Role)) {
      next(new UnauthorizedError("Insufficient permissions"));
      return;
    }

    next();
  };
};

/**
 * Extract JWT token from request
 * Supports Authorization header and cookies
 */
const extractToken = (req: AuthRequest): string | null => {
  // Check Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7); // Remove "Bearer " prefix
  }

  // Check cookies (if using httpOnly cookies)
  if (req.cookies?.accessToken) {
    return req.cookies.accessToken;
  }

  return null;
};
