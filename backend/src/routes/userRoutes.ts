import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { validate } from "../middleware/validationMiddleware";
import { authMiddleware, authorize } from "../middleware/authMiddleware";
import { createInviteSchema } from "../utils/validators";
import { Role } from "../models/User";
import * as userController from "../controllers/userController";

const router = Router();

/**
 * GET /api/users
 * Get all users (Admin only)
 */
router.get(
  "/",
  authMiddleware,
  authorize(Role.ADMIN),
  asyncHandler(userController.getAllUsers)
);

/**
 * GET /api/users/:userId
 * Get user by ID (Admin or self)
 */
router.get(
  "/:userId",
  authMiddleware,
  asyncHandler(userController.getUserById)
);

/**
 * POST /api/users/invites/create
 * Create invite (Admin only)
 */
router.post(
  "/invites/create",
  authMiddleware,
  authorize(Role.ADMIN),
  validate(createInviteSchema),
  asyncHandler(userController.createInvite)
);

/**
 * GET /api/users/invites/status
 * Get invite status
 */
router.get(
  "/invites/status",
  asyncHandler(userController.getInviteStatus)
);

/**
 * GET /api/users/invites
 * List invites (Admin only)
 */
router.get(
  "/invites",
  authMiddleware,
  authorize(Role.ADMIN),
  asyncHandler(userController.listInvites)
);

/**
 * DELETE /api/users/invites/:inviteId
 * Revoke invite (Admin only)
 */
router.delete(
  "/invites/:inviteId",
  authMiddleware,
  authorize(Role.ADMIN),
  asyncHandler(userController.revokeInvite)
);

/**
 * PATCH /api/users/:userId/status
 * Change user status (Admin only)
 */
router.patch(
  "/:userId/status",
  authMiddleware,
  authorize(Role.ADMIN),
  asyncHandler(userController.deactivateUser)
);

/**
 * PATCH /api/users/:userId/role
 * Change user role (Admin only)
 */
router.patch(
  "/:userId/role",
  authMiddleware,
  authorize(Role.ADMIN),
  asyncHandler(userController.changeUserRole)
);

export default router;
