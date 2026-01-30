import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { User, Role, Status } from "../models/User";
import { Invite, InviteStatus } from "../models/Invite";
import { generateRandomToken } from "../utils/password";
import { NotFoundError, ForbiddenError, ValidationError } from "../utils/errors";

/**
 * Get all users (Admin only, paginated)
 */
export const getAllUsers = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  if (!req.userId || req.role !== Role.ADMIN) {
    throw new ForbiddenError("Only admins can view all users");
  }

  // Pagination parameters
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(100, parseInt(req.query.limit as string) || 10);
  const skip = (page - 1) * limit;

  // Get total count
  const total = await User.countDocuments({});

  // Get paginated users
  const users = await User.find({})
    .select("-password")
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const totalPages = Math.ceil(total / limit);

  res.status(200).json({
    success: true,
    data: users,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  });
};

/**
 * Get user by ID (Admin or self)
 */
export const getUserById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { userId } = req.params;

  if (req.role !== Role.ADMIN && req.userId !== userId) {
    throw new ForbiddenError("You don't have permission to view this user");
  }

  const user = await User.findById(userId).select("-password");

  if (!user) {
    throw new NotFoundError("User not found");
  }

  res.status(200).json({
    success: true,
    data: user,
  });
};

/**
 * Create invite (Admin only)
 */
export const createInvite = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  if (req.role !== Role.ADMIN) {
    throw new ForbiddenError("Only admins can create invites");
  }

  const { email, role, projectId } = req.body;

  // Check if email is already registered
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ValidationError("User with this email already exists");
  }

  // Check if invite already exists and is pending
  const existingInvite = await Invite.findOne({
    email,
    status: InviteStatus.PENDING,
  });

  if (existingInvite) {
    throw new ValidationError("Invite already sent to this email");
  }

  const inviteToken = generateRandomToken();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const invite = new Invite({
    email,
    invitedBy: req.userId,
    role,
    inviteToken,
    expiresAt,
    projectId: projectId || undefined,
    status: InviteStatus.PENDING,
  });

  await invite.save();

  // TODO: Send email with invite link
  // Email should include: register URL with inviteToken as query param

  res.status(201).json({
    success: true,
    message: "Invite created successfully",
    data: {
      id: invite._id,
      email: invite.email,
      role: invite.role,
      status: invite.status,
      expiresAt: invite.expiresAt,
      // In production, don't return token in response
      // It should only be sent via email
    },
  });
};

/**
 * Get invite status
 */
export const getInviteStatus = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { inviteToken } = req.query;

  if (!inviteToken || typeof inviteToken !== "string") {
    throw new ValidationError("Invalid invite token");
  }

  const invite = await Invite.findOne({ inviteToken });

  if (!invite) {
    throw new NotFoundError("Invite not found or has been revoked");
  }

  if (invite.expiresAt < new Date()) {
    // Mark as expired
    invite.status = InviteStatus.EXPIRED;
    await invite.save();
    throw new ValidationError("Invite has expired");
  }

  if (invite.status !== InviteStatus.PENDING) {
    throw new ValidationError(
      `Invite has been ${invite.status.toLowerCase()}`
    );
  }

  res.status(200).json({
    success: true,
    data: {
      email: invite.email,
      role: invite.role,
      expiresAt: invite.expiresAt,
    },
  });
};

/**
 * List invites (Admin only)
 */
export const listInvites = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  if (req.role !== Role.ADMIN) {
    throw new ForbiddenError("Only admins can list invites");
  }

  const { status } = req.query;

  const filter: any = {};
  if (status) {
    filter.status = status;
  }

  const invites = await Invite.find(filter)
    .populate("invitedBy", "name email")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: invites,
  });
};

/**
 * Revoke invite (Admin only)
 */
export const revokeInvite = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  if (req.role !== Role.ADMIN) {
    throw new ForbiddenError("Only admins can revoke invites");
  }

  const { inviteId } = req.params;

  const invite = await Invite.findById(inviteId);

  if (!invite) {
    throw new NotFoundError("Invite not found");
  }

  if (invite.status !== InviteStatus.PENDING) {
    throw new ValidationError("Only pending invites can be revoked");
  }

  invite.status = InviteStatus.REVOKED;
  await invite.save();

  res.status(200).json({
    success: true,
    message: "Invite revoked successfully",
  });
};

/**
 * Deactivate user (Admin only)
 */
export const deactivateUser = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  if (req.role !== Role.ADMIN) {
    throw new ForbiddenError("Only admins can deactivate users");
  }

  const { userId } = req.params;

  // Cannot deactivate self
  if (userId === req.userId) {
    throw new ValidationError("Cannot deactivate your own account");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new NotFoundError("User not found");
  }

  user.status = Status.INACTIVE;
  await user.save();

  res.status(200).json({
    success: true,
    message: "User deactivated successfully",
  });
};

/**
 * Change user role (Admin only)
 */
export const changeUserRole = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  if (req.role !== Role.ADMIN) {
    throw new ForbiddenError("Only admins can change user roles");
  }

  const { userId } = req.params;
  const { role } = req.body;

  if (!Object.values(Role).includes(role)) {
    throw new ValidationError("Invalid role");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new NotFoundError("User not found");
  }

  user.role = role;
  await user.save();

  res.status(200).json({
    success: true,
    message: "User role updated successfully",
    data: user,
  });
};
