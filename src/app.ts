import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { json } from "body-parser";

// Import config
import { connectDB } from "./config/db";
import { validateEnvironment } from "./config/environment";

// Import routes
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import projectRoutes from "./routes/projectRoutes";

// Import middleware
import { errorHandler, notFound } from "./middleware/errorHandler";

// Load environment variables
dotenv.config();

// Validate environment on startup
validateEnvironment();

const app = express();

// Middleware
app.use(cors());
app.use(json());

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "API is healthy",
    timestamp: new Date().toISOString(),
  });
});

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "API Running",
    version: "1.0.0",
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);

// Error handling (must be last)
app.use(notFound);
app.use(errorHandler);

// Database connection on startup
connectDB().then(() => {
  console.log("✅ Database connected");
}).catch((error) => {
  console.error("❌ Database connection failed:", error);
  process.exit(1);
});

export default app;
