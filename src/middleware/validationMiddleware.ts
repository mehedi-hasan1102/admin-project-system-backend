import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
import { ValidationError } from "../utils/errors";

/**
 * Validation middleware factory
 * Validates request body against a Zod schema
 */
export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validated = schema.parse(req.body);
      req.body = validated;
      next();
    } catch (error: any) {
      const formattedErrors = error.errors?.map((e: any) => ({
        field: e.path.join("."),
        message: e.message,
      }));

      next(new ValidationError("Validation failed", formattedErrors));
    }
  };
};

/**
 * Validates query parameters against a Zod schema
 */
export const validateQuery = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validated = schema.parse(req.query);
      req.query = validated as any;
      next();
    } catch (error: any) {
      const formattedErrors = error.errors?.map((e: any) => ({
        field: e.path.join("."),
        message: e.message,
      }));

      next(new ValidationError("Query validation failed", formattedErrors));
    }
  };
};

/**
 * Validates URL parameters against a Zod schema
 */
export const validateParams = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validated = schema.parse(req.params);
      req.params = validated as any;
      next();
    } catch (error: any) {
      const formattedErrors = error.errors?.map((e: any) => ({
        field: e.path.join("."),
        message: e.message,
      }));

      next(new ValidationError("Params validation failed", formattedErrors));
    }
  };
};
