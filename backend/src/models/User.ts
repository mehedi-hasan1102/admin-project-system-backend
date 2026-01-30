import { Schema, model, Document } from "mongoose";

export enum Role {
  ADMIN = "ADMIN",
  MANAGER = "MANAGER",
  STAFF = "STAFF",
}

export enum Status {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: Role;
  status: Status;
  invitedAt?: Date; // When this user was invited
  inviteToken?: string; // Unique token for accepting invite
  inviteTokenExpiry?: Date;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false, // Don't include password by default in queries
    },
    role: {
      type: String,
      enum: Object.values(Role),
      default: Role.STAFF,
    },
    status: {
      type: String,
      enum: Object.values(Status),
      default: Status.ACTIVE,
    },
    invitedAt: {
      type: Date,
    },
    inviteToken: {
      type: String,
      select: false,
    },
    inviteTokenExpiry: {
      type: Date,
      select: false,
    },
    lastLogin: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Index for email lookups
userSchema.index({ email: 1 });

export const User = model<IUser>("User", userSchema);
