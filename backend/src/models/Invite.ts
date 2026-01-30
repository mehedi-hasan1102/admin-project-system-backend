import { Schema, model, Document } from "mongoose";

export enum InviteStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  DECLINED = "DECLINED",
  REVOKED = "REVOKED",
  EXPIRED = "EXPIRED",
}

export interface IInvite extends Document {
  email: string;
  invitedBy: Schema.Types.ObjectId; // User ID of who invited
  role: "ADMIN" | "MANAGER" | "STAFF";
  status: InviteStatus;
  expiresAt: Date;
  acceptedAt?: Date;
  acceptedBy?: Schema.Types.ObjectId; // If accepted, user ID of who accepted
  projectId?: Schema.Types.ObjectId; // Optional: if invite is project-specific
  createdAt: Date;
  updatedAt: Date;
}

const inviteSchema = new Schema<IInvite>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    invitedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: ["ADMIN", "MANAGER", "STAFF"],
      default: "STAFF",
    },
    status: {
      type: String,
      enum: Object.values(InviteStatus),
      default: InviteStatus.PENDING,
    },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
    acceptedAt: {
      type: Date,
    },
    acceptedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
    },
  },
  { timestamps: true }
);

// Index for finding pending invites
inviteSchema.index({ email: 1, status: 1 });
inviteSchema.index({ expiresAt: 1 });

export const Invite = model<IInvite>("Invite", inviteSchema);
