import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { User, Role } from "../models/User";
import { Invite, InviteStatus } from "../models/Invite";
import { hashPassword, comparePassword, generateRandomToken } from "../utils/password";
import { generateTokens } from "../utils/jwt";
import {
  ValidationError,
  UnauthorizedError,
  ConflictError,
  NotFoundError,
} from "../utils/errors";
import { LoginInput, RegisterInput } from "../utils/validators";

/**
 * Login with email and password
 */
export const login = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { email, password } = req.body as LoginInput;

  // Find user and include password field
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new UnauthorizedError("Invalid email or password");
  }

  // Verify password
  const isPasswordValid = await comparePassword(password, user.password);

  if (!isPasswordValid) {
    throw new UnauthorizedError("Invalid email or password");
  }

  // Check if user is active
  if (user.status === "INACTIVE") {
    throw new UnauthorizedError("User account is inactive");
  }

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens({
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  });

  // Update last login
  await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: {
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    },
  });
};

/**
 * Register user with invitation token
 */
export const register = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { name, email, password, inviteToken } = req.body as RegisterInput;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ConflictError("Email already registered");
  }

  // Verify invite if token is provided
  if (inviteToken) {
    const invite = await Invite.findOne({
      email,
      inviteToken,
      status: InviteStatus.PENDING,
      expiresAt: { $gt: new Date() },
    });

    if (!invite) {
      throw new ValidationError("Invalid or expired invitation");
    }

    // Create user with invited role
    const hashedPassword = await hashPassword(password);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: invite.role,
      status: "ACTIVE",
      invitedAt: invite.createdAt,
    });

    await newUser.save();

    // Mark invite as accepted
    await Invite.findByIdAndUpdate(invite._id, {
      status: InviteStatus.ACCEPTED,
      acceptedBy: newUser._id,
      acceptedAt: new Date(),
    });

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens({
      userId: newUser._id.toString(),
      email: newUser.email,
      role: newUser.role,
    });

    res.status(201).json({
      success: true,
      message: "Registration successful",
      data: {
        accessToken,
        refreshToken,
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
      },
    });
  } else {
    // Self-registration (default to STAFF role)
    const hashedPassword = await hashPassword(password);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: Role.STAFF,
      status: "ACTIVE",
    });

    await newUser.save();

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens({
      userId: newUser._id.toString(),
      email: newUser.email,
      role: newUser.role,
    });

    res.status(201).json({
      success: true,
      message: "Registration successful",
      data: {
        accessToken,
        refreshToken,
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
      },
    });
  }
};

/**
 * Get current user profile
 */
export const getProfile = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  if (!req.userId) {
    throw new UnauthorizedError("User not authenticated");
  }

  const user = await User.findById(req.userId);

  if (!user) {
    throw new NotFoundError("User not found");
  }

  res.status(200).json({
    success: true,
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
    },
  });
};

/**
 * Update user profile
 */
export const updateProfile = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  if (!req.userId) {
    throw new UnauthorizedError("User not authenticated");
  }

  const { name } = req.body;

  const user = await User.findByIdAndUpdate(
    req.userId,
    { name },
    { new: true }
  );

  if (!user) {
    throw new NotFoundError("User not found");
  }

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
};
