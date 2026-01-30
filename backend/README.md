# Admin & Project Management System - Backend

A production-ready backend API built with **Node.js, Express, TypeScript, MongoDB, and JWT authentication**.

## 📋 Table of Contents

1. [Features](#features)
2. [Project Structure](#project-structure)
3. [Getting Started](#getting-started)
4. [Environment Setup](#environment-setup)
5. [API Documentation](#api-documentation)
6. [Authentication Flow](#authentication-flow)
7. [Role-Based Access Control](#role-based-access-control)
8. [Database Models](#database-models)
9. [Error Handling](#error-handling)
10. [Testing](#testing)
11. [Deployment](#deployment)
12. [Troubleshooting](#troubleshooting)

---

## ✨ Features

### 🔐 Security
- **JWT Authentication** with access & refresh tokens
- **Password Hashing** with bcrypt (SALT_ROUNDS: 10)
- **Role-Based Access Control (RBAC)** with 3 roles: ADMIN, MANAGER, STAFF
- **Request Validation** using Zod schemas
- **Error Handling** with custom error classes and global error middleware
- **Environment Validation** on startup

### 👥 User Management
- User registration and login
- Invite-based registration flow
- User profile management
- Admin controls: deactivate users, change roles
- Last login tracking

### 📊 Project Management
- Create and manage projects
- Team member management with roles
- Soft delete support (data preserved, not removed)
- Project status tracking: ACTIVE, ARCHIVED, COMPLETED, ON_HOLD

### 📧 Invite System
- Admin can invite users via email
- Invite tokens with 7-day expiry
- Status tracking: PENDING, ACCEPTED, DECLINED, REVOKED, EXPIRED
- Accept/decline invites
- Revoke pending invites

### 🗂️ Task Management (Models ready)
- Task CRUD operations (endpoints coming soon)
- Task status: TODO, IN_PROGRESS, IN_REVIEW, DONE, BLOCKED
- Priority levels: LOW, MEDIUM, HIGH, URGENT
- Assign tasks to team members
- Due date tracking

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── db.ts                 # MongoDB connection setup
│   │   └── environment.ts        # Environment validation with Zod
│   ├── models/
│   │   ├── User.ts              # User model with RBAC support
│   │   ├── Project.ts           # Project model with soft delete
│   │   ├── Invite.ts            # Invite system model
│   │   └── Task.ts              # Task model
│   ├── controllers/
│   │   ├── authController.ts    # Login, register, profile
│   │   ├── userController.ts    # User & invite management
│   │   └── projectController.ts # Project CRUD & team management
│   ├── routes/
│   │   ├── authRoutes.ts        # Auth endpoints
│   │   ├── userRoutes.ts        # User endpoints
│   │   └── projectRoutes.ts     # Project endpoints
│   ├── middleware/
│   │   ├── authMiddleware.ts    # JWT verification & RBAC
│   │   ├── errorHandler.ts      # Global error handling
│   │   └── validationMiddleware.ts # Request validation
│   ├── utils/
│   │   ├── password.ts          # Bcrypt utilities
│   │   ├── jwt.ts               # JWT token generation/verification
│   │   ├── errors.ts            # Custom error classes
│   │   ├── validators.ts        # Zod validation schemas
│   │   └── asyncHandler.ts      # Error wrapping for async routes
│   ├── app.ts                   # Express app setup
│   └── server.ts                # Server entry point
├── package.json
├── tsconfig.json
├── .env                         # Environment variables
├── .gitignore
├── CODE_REVIEW.md              # Detailed code review
├── IMPLEMENTATION_SUMMARY.md   # What was implemented
├── TESTING_GUIDE.md            # How to test with Postman
└── README.md                   # This file
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and **npm** 9+
- **MongoDB** Atlas account or local MongoDB
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd admin-project-system/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables** (see next section)
   ```bash
   cp .env.example .env
   # Edit .env with your values
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

   Expected output:
   ```
   ✅ Environment variables validated successfully
   ✅ Database connected
   🚀 Server running on http://localhost:5000
   Environment: development
   ```

### Build for Production

```bash
npm run build      # Compiles TypeScript to dist/
npm start          # Runs compiled JavaScript
```

---

## 🔧 Environment Setup

### Create `.env` file

```env
# Server
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority

# JWT
JWT_SECRET=your-secret-key-minimum-32-characters-long
```

### ⚠️ Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment type | `development`, `production`, `test` |
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://...` |
| `JWT_SECRET` | Secret key for JWT (min 32 chars) | Random secure string |

### Validation

Environment variables are validated on startup using Zod. If any are missing or invalid, the server will exit with detailed error messages.

---

## 📚 API Documentation

### Base URL
```
http://localhost:5000
```

### Health Check
```http
GET /health
```

### Authentication Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | ❌ | Register new user |
| POST | `/api/auth/login` | ❌ | Login with email/password |
| GET | `/api/auth/profile` | ✅ | Get current user profile |
| PUT | `/api/auth/profile` | ✅ | Update user profile |

### User Management Endpoints

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/api/users` | ✅ | ADMIN | List all users |
| GET | `/api/users/:userId` | ✅ | ADMIN\|SELF | Get user by ID |
| POST | `/api/users/invites/create` | ✅ | ADMIN | Create invite |
| GET | `/api/users/invites/status` | ❌ | - | Check invite status |
| GET | `/api/users/invites` | ✅ | ADMIN | List invites |
| DELETE | `/api/users/invites/:inviteId` | ✅ | ADMIN | Revoke invite |
| PUT | `/api/users/:userId/deactivate` | ✅ | ADMIN | Deactivate user |
| PUT | `/api/users/:userId/role` | ✅ | ADMIN | Change user role |

### Project Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/projects` | ✅ | Create project |
| GET | `/api/projects` | ✅ | Get user projects |
| GET | `/api/projects/:projectId` | ✅ | Get project details |
| PUT | `/api/projects/:projectId` | ✅ | Update project |
| DELETE | `/api/projects/:projectId` | ✅ | Soft delete project |
| POST | `/api/projects/:projectId/team-members` | ✅ | Add team member |
| DELETE | `/api/projects/:projectId/team-members/:memberId` | ✅ | Remove team member |

---

## 🔐 Authentication Flow

### 1. Register (Self)
```typescript
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!"  // Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
}
→ User created with STAFF role
→ Returns { accessToken, refreshToken, user }
```

### 2. Register with Invite
```typescript
POST /api/auth/register
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "SecurePass123!",
  "inviteToken": "token-from-email"
}
→ User created with role from invite (ADMIN, MANAGER, or STAFF)
→ Invite marked as ACCEPTED
→ Returns { accessToken, refreshToken, user }
```

### 3. Login
```typescript
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
→ Verifies password
→ Updates lastLogin
→ Returns { accessToken, refreshToken, user }
```

### 4. Use Token
```typescript
GET /api/auth/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
→ Returns authenticated user profile
```

### Token Details
- **Access Token**: Expires in 15 minutes
- **Refresh Token**: Expires in 7 days
- **Format**: JWT (JSON Web Token)
- **Algorithm**: HS256

---

## 👥 Role-Based Access Control

### Roles

| Role | Permissions |
|------|-------------|
| **ADMIN** | Full system access, create invites, manage all users, delete projects |
| **MANAGER** | Create projects, manage own projects, assign tasks |
| **STAFF** | Create projects, view assigned tasks, collaborate |

### Usage in Routes

```typescript
// Require ADMIN role
router.post("/", authMiddleware, authorize(Role.ADMIN), handler);

// Require ADMIN or MANAGER
router.post("/", authMiddleware, authorize(Role.ADMIN, Role.MANAGER), handler);

// Require authentication only
router.post("/", authMiddleware, handler);

// Public endpoint
router.post("/", handler);
```

---

## 🗄️ Database Models

### User
```typescript
{
  _id: ObjectId
  name: String (required)
  email: String (required, unique)
  password: String (hashed, required)
  role: "ADMIN" | "MANAGER" | "STAFF" (default: STAFF)
  status: "ACTIVE" | "INACTIVE" (default: ACTIVE)
  invitedAt?: Date
  inviteToken?: String
  inviteTokenExpiry?: Date
  lastLogin?: Date
  createdAt: Date
  updatedAt: Date
}
```

### Project
```typescript
{
  _id: ObjectId
  name: String (required, 3-100 chars)
  description?: String (max 500 chars)
  status: "ACTIVE" | "ARCHIVED" | "COMPLETED" | "ON_HOLD"
  admin: ObjectId (ref: User)
  teamMembers: [
    {
      userId: ObjectId (ref: User)
      role: "ADMIN" | "MANAGER" | "MEMBER"
    }
  ]
  deletedAt?: Date (null = not deleted)
  createdAt: Date
  updatedAt: Date
}
```

### Invite
```typescript
{
  _id: ObjectId
  email: String (required)
  invitedBy: ObjectId (ref: User)
  role: "ADMIN" | "MANAGER" | "STAFF"
  status: "PENDING" | "ACCEPTED" | "DECLINED" | "REVOKED" | "EXPIRED"
  expiresAt: Date (7 days default)
  acceptedAt?: Date
  acceptedBy?: ObjectId (ref: User)
  projectId?: ObjectId (ref: Project)
  createdAt: Date
  updatedAt: Date
}
```

### Task
```typescript
{
  _id: ObjectId
  title: String (required, 3-200 chars)
  description?: String (max 2000 chars)
  projectId: ObjectId (ref: Project)
  assignedTo?: ObjectId (ref: User)
  createdBy: ObjectId (ref: User)
  status: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE" | "BLOCKED"
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT"
  dueDate?: Date
  deletedAt?: Date (null = not deleted)
  createdAt: Date
  updatedAt: Date
}
```

---

## ⚠️ Error Handling

### Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "errors": []  // Optional: detailed validation errors
}
```

### HTTP Status Codes

| Code | Error | Example |
|------|-------|---------|
| 400 | Bad Request | Invalid input data |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Email already exists |
| 500 | Server Error | Unexpected error |

### Example Errors

**Validation Error (400)**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email address"
    }
  ]
}
```

**Unauthorized (401)**
```json
{
  "success": false,
  "message": "No token provided"
}
```

**Forbidden (403)**
```json
{
  "success": false,
  "message": "Insufficient permissions"
}
```

---

## 🧪 Testing

### Postman Collection

1. Open Postman
2. Create collection "Admin System API"
3. Add environment variables:
   - `baseUrl`: http://localhost:5000
   - `accessToken`: (populated from login)
   - `userId`: (populated from login)

### Quick Test Steps

1. **Register**
   ```
   POST {{baseUrl}}/api/auth/register
   ```

2. **Login**
   ```
   POST {{baseUrl}}/api/auth/login
   Save accessToken from response
   ```

3. **Get Profile**
   ```
   GET {{baseUrl}}/api/auth/profile
   Header: Authorization: Bearer {{accessToken}}
   ```

4. **Create Project**
   ```
   POST {{baseUrl}}/api/projects
   Header: Authorization: Bearer {{accessToken}}
   ```

See **TESTING_GUIDE.md** for detailed Postman examples.

---

## 🚀 Deployment

### Prerequisites
- Node.js 18+ on server
- MongoDB Atlas (cloud) or MongoDB (self-hosted)
- Environment variables configured

### Steps

1. **Build application**
   ```bash
   npm run build
   ```

2. **Set production environment**
   ```bash
   NODE_ENV=production
   ```

3. **Install production dependencies only**
   ```bash
   npm install --production
   ```

4. **Start server**
   ```bash
   npm start
   ```

### Recommended: Using PM2

```bash
npm install -g pm2
pm2 start npm --name "admin-api" -- start
pm2 save
pm2 startup
```

### Docker Deployment (Optional)

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
ENV NODE_ENV=production
EXPOSE 5000
CMD ["node", "dist/server.js"]
```

Build and run:
```bash
docker build -t admin-api .
docker run -p 5000:5000 --env-file .env admin-api
```

---

## 🔍 Troubleshooting

### "MongoDB connection error"
- Check MONGODB_URI in .env
- Ensure IP whitelist includes your server
- Test connection with MongoDB Compass

### "Environment validation failed"
- All required variables must be set
- JWT_SECRET must be min 32 characters
- Check exact variable names (case-sensitive)

### "No token provided"
- Add Authorization header: `Bearer <token>`
- Token format: `Authorization: Bearer eyJhbGc...`

### "Invalid token"
- Token may be expired (15 min for access token)
- Use refresh token to get new access token
- Verify token is from recent login

### "Insufficient permissions"
- User role doesn't match endpoint requirements
- Check user role in database
- Only ADMIN can create invites

### CORS Errors
- Frontend and backend must have matching CORS settings
- Update CORS in app.ts if needed:
  ```typescript
  app.use(cors({
    origin: ["http://localhost:3000"],
    credentials: true
  }));
  ```

---

## 📝 Development Guidelines

### Code Style
- Use TypeScript for type safety
- Follow async/await pattern
- Use custom error classes
- Keep controllers thin, logic in services

### Naming Conventions
- Variables: camelCase
- Classes: PascalCase
- Constants: UPPER_SNAKE_CASE
- Files: kebab-case.ts (except models)

### Adding New Features

1. **Create model** in `src/models/`
2. **Create controller** in `src/controllers/`
3. **Create routes** in `src/routes/`
4. **Add validation schemas** in `src/utils/validators.ts`
5. **Register routes** in `src/app.ts`
6. **Test with Postman**

---

## 📚 Additional Resources

- [Express.js Docs](https://expressjs.com/)
- [MongoDB Docs](https://docs.mongodb.com/)
- [Mongoose Docs](https://mongoosejs.com/)
- [JWT.io](https://jwt.io/)
- [Zod Validation](https://zod.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

## 📄 License

MIT

---

## 👨‍💻 Support

For issues or questions:
1. Check TESTING_GUIDE.md
2. Review CODE_REVIEW.md
3. Check console logs and error messages
4. Verify environment variables

---

**Happy coding!** 🚀
