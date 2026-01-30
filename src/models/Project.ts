import { Schema, model, Document, Query } from "mongoose";

export enum ProjectStatus {
  ACTIVE = "ACTIVE",
  ARCHIVED = "ARCHIVED",
  COMPLETED = "COMPLETED",
  ON_HOLD = "ON_HOLD",
}

export interface IProject extends Document {
  name: string;
  description?: string;
  status: ProjectStatus;
  createdBy: Schema.Types.ObjectId; // User ID of project creator
  admin?: Schema.Types.ObjectId; // Project admin (for backwards compatibility)
  teamMembers?: Array<{
    userId: Schema.Types.ObjectId;
    role: "ADMIN" | "MANAGER" | "MEMBER";
  }>;
  isDeleted: boolean; // Soft delete boolean
  deletedAt?: Date; // Soft delete timestamp
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema<IProject>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    status: {
      type: String,
      enum: Object.values(ProjectStatus),
      default: ProjectStatus.ACTIVE,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    admin: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    teamMembers: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        role: {
          type: String,
          enum: ["ADMIN", "MANAGER", "MEMBER"],
          default: "MEMBER",
        },
        _id: false,
      },
    ],
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  { timestamps: true }
);

// Index for common queries
projectSchema.index({ createdBy: 1, isDeleted: 1 });

export const Project = model<IProject>("Project", projectSchema);
