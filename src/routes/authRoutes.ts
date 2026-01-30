import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { validate } from "../middleware/validationMiddleware";
import { authMiddleware } from "../middleware/authMiddleware";
import { loginSchema, registerSchema } from "../utils/validators";
import * as authController from "../controllers/authController";

const router = Router();

/**
 * POST /api/auth/login
 * Login with email and password
 */
router.post(
  "/login",
  validate(loginSchema),
  asyncHandler(authController.login)
);

/**
 * POST /api/auth/register
 * Register new user (with optional invitation token)
 */
router.post(
  "/register",
  validate(registerSchema),
  asyncHandler(authController.register)
);

/**
 * GET /api/auth/profile
 * Get current user profile
 */
router.get(
  "/profile",
  authMiddleware,
  asyncHandler(authController.getProfile)
);

/**
 * PUT /api/auth/profile
 * Update current user profile
 */
router.put(
  "/profile",
  authMiddleware,
  asyncHandler(authController.updateProfile)
);

export default router;
