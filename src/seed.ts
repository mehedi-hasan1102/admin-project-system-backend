import mongoose from "mongoose";
import { User, Role, Status } from "./models/User";
import { Project, ProjectStatus } from "./models/Project";
import { Invite, InviteStatus } from "./models/Invite";
import { hashPassword } from "./utils/password";
import dotenv from "dotenv";

dotenv.config();

const seed = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error("MONGODB_URI not configured");
    }

    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB");

    // Clear existing data
    await User.deleteMany({});
    await Project.deleteMany({});
    await Invite.deleteMany({});
    console.log("🧹 Cleared existing data");

    // Create users
    const admin = await User.create({
      name: "Admin User",
      email: "admin@example.com",
      password: await hashPassword("AdminPass123!"),
      role: Role.ADMIN,
      status: Status.ACTIVE,
    });
    console.log("✅ Created admin user");

    const manager = await User.create({
      name: "Manager User",
      email: "manager@example.com",
      password: await hashPassword("ManagerPass123!"),
      role: Role.MANAGER,
      status: Status.ACTIVE,
    });
    console.log("✅ Created manager user");

    const staff = await User.create({
      name: "Staff User",
      email: "staff@example.com",
      password: await hashPassword("StaffPass123!"),
      role: Role.STAFF,
      status: Status.ACTIVE,
    });
    console.log("✅ Created staff user");

    // Create projects - using any type to bypass Mongoose strict typing
    const project1 = await Project.create({
      name: "Website Redesign",
      description: "Redesign company website",
      status: ProjectStatus.ACTIVE,
      createdBy: admin._id as any,
      admin: admin._id as any,
      teamMembers: [
        { userId: admin._id as any, role: "ADMIN" },
        { userId: manager._id as any, role: "MANAGER" },
        { userId: staff._id as any, role: "MEMBER" },
      ],
      isDeleted: false,
    } as any);
    console.log("✅ Created project 1");

    const project2 = await Project.create({
      name: "Mobile App Development",
      description: "Develop mobile application",
      status: ProjectStatus.ACTIVE,
      createdBy: manager._id as any,
      admin: manager._id as any,
      teamMembers: [
        { userId: manager._id as any, role: "ADMIN" },
        { userId: staff._id as any, role: "MEMBER" },
      ],
      isDeleted: false,
    } as any);
    console.log("✅ Created project 2");

    // Create invites
    const invite1 = await Invite.create({
      email: "newuser@example.com",
      invitedBy: admin._id as any,
      role: Role.MANAGER,
      status: InviteStatus.PENDING,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    } as any);
    console.log("✅ Created invite 1");

    const invite2 = await Invite.create({
      email: "anotheruser@example.com",
      invitedBy: admin._id as any,
      role: Role.STAFF,
      status: InviteStatus.PENDING,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    } as any);
    console.log("✅ Created invite 2");

    console.log("\n📊 Seed Data Summary:");
    console.log("=====================================");
    console.log("Users Created:");
    console.log(`  - Admin: admin@example.com / AdminPass123!`);
    console.log(`  - Manager: manager@example.com / ManagerPass123!`);
    console.log(`  - Staff: staff@example.com / StaffPass123!`);
    console.log("\nProjects Created:");
    console.log(`  - Website Redesign (Admin as owner)`);
    console.log(`  - Mobile App Development (Manager as owner)`);
    console.log("\nInvites Created:");
    console.log(`  - newuser@example.com (MANAGER role)`);
    console.log(`  - anotheruser@example.com (STAFF role)`);
    console.log("=====================================\n");

    await mongoose.disconnect();
    console.log("✅ Seed data created successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seed error:", error);
    process.exit(1);
  }
};

seed();
