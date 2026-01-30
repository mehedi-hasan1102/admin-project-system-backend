# API Testing Guide - Postman Collection

This guide shows how to test all endpoints using Postman.

## 1. ✅ Start the Server

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

---

## 2. 🔑 Authentication Endpoints

### **Register New User**

```http
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Expected Response (201):**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "65f8a1b2c3d4e5f6g7h8i9j0",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "STAFF"
    }
  }
}
```

---

### **Login**

```http
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "65f8a1b2c3d4e5f6g7h8i9j0",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "STAFF"
    }
  }
}
```

**Save the accessToken for next requests!**

---

### **Get Current User Profile**

```http
GET http://localhost:5000/api/auth/profile
Authorization: Bearer <ACCESS_TOKEN>
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "65f8a1b2c3d4e5f6g7h8i9j0",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "STAFF",
    "status": "ACTIVE",
    "createdAt": "2025-01-30T20:05:00.000Z"
  }
}
```

---

### **Update Profile**

```http
PUT http://localhost:5000/api/auth/profile
Authorization: Bearer <ACCESS_TOKEN>
Content-Type: application/json

{
  "name": "John Updated"
}
```

---

## 3. 👥 User Management (Admin Only)

### **Create Invite**

First, create an admin user for testing:

```http
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "AdminPass123!"
}
```

Then manually update in MongoDB to make them ADMIN:
```javascript
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "ADMIN" } }
)
```

Now create an invite:

```http
POST http://localhost:5000/api/users/invites/create
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json

{
  "email": "newuser@example.com",
  "role": "MANAGER"
}
```

**Expected Response (201):**
```json
{
  "success": true,
  "message": "Invite created successfully",
  "data": {
    "id": "65f8a1b2c3d4e5f6g7h8i9j0",
    "email": "newuser@example.com",
    "role": "MANAGER",
    "status": "PENDING",
    "expiresAt": "2025-02-06T20:05:00.000Z"
  }
}
```

---

### **Check Invite Status**

```http
GET http://localhost:5000/api/users/invites/status?inviteToken=<TOKEN>
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "email": "newuser@example.com",
    "role": "MANAGER",
    "expiresAt": "2025-02-06T20:05:00.000Z"
  }
}
```

---

### **Register With Invite**

```http
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "New User",
  "email": "newuser@example.com",
  "password": "NewPass123!",
  "inviteToken": "<TOKEN_FROM_INVITE>"
}
```

**Result:** User created with MANAGER role (from invite), invite marked as ACCEPTED

---

### **List All Users (Admin)**

```http
GET http://localhost:5000/api/users
Authorization: Bearer <ADMIN_TOKEN>
```

---

### **List Invites (Admin)**

```http
GET http://localhost:5000/api/users/invites
Authorization: Bearer <ADMIN_TOKEN>
```

---

### **List Pending Invites Only**

```http
GET http://localhost:5000/api/users/invites?status=PENDING
Authorization: Bearer <ADMIN_TOKEN>
```

---

### **Revoke Invite (Admin)**

```http
DELETE http://localhost:5000/api/users/invites/<INVITE_ID>
Authorization: Bearer <ADMIN_TOKEN>
```

---

### **Deactivate User (Admin)**

```http
PUT http://localhost:5000/api/users/<USER_ID>/deactivate
Authorization: Bearer <ADMIN_TOKEN>
```

---

### **Change User Role (Admin)**

```http
PUT http://localhost:5000/api/users/<USER_ID>/role
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json

{
  "role": "MANAGER"
}
```

---

## 4. 📊 Project Management

### **Create Project**

```http
POST http://localhost:5000/api/projects
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "name": "Website Redesign",
  "description": "Redesign company website",
  "status": "ACTIVE"
}
```

**Expected Response (201):**
```json
{
  "success": true,
  "message": "Project created successfully",
  "data": {
    "_id": "65f8a1b2c3d4e5f6g7h8i9j0",
    "name": "Website Redesign",
    "description": "Redesign company website",
    "status": "ACTIVE",
    "admin": "65f8a1b2c3d4e5f6g7h8i9j0",
    "teamMembers": [
      {
        "userId": "65f8a1b2c3d4e5f6g7h8i9j0",
        "role": "ADMIN"
      }
    ],
    "createdAt": "2025-01-30T20:05:00.000Z",
    "updatedAt": "2025-01-30T20:05:00.000Z"
  }
}
```

---

### **Get All User Projects**

```http
GET http://localhost:5000/api/projects
Authorization: Bearer <TOKEN>
```

Returns only projects where user is admin or team member (excludes soft deleted).

---

### **Get Project Details**

```http
GET http://localhost:5000/api/projects/<PROJECT_ID>
Authorization: Bearer <TOKEN>
```

---

### **Update Project**

```http
PUT http://localhost:5000/api/projects/<PROJECT_ID>
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "name": "Website Redesign 2025",
  "description": "Updated description",
  "status": "IN_PROGRESS"
}
```

**Only project admin can update!**

---

### **Soft Delete Project**

```http
DELETE http://localhost:5000/api/projects/<PROJECT_ID>
Authorization: Bearer <TOKEN>
```

**Result:**
- Sets `deletedAt` timestamp
- Associated tasks also soft deleted
- Project hidden from listings

---

### **Add Team Member**

```http
POST http://localhost:5000/api/projects/<PROJECT_ID>/team-members
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "userId": "<USER_ID>",
  "role": "MEMBER"
}
```

Roles: `ADMIN`, `MANAGER`, `MEMBER`

---

### **Remove Team Member**

```http
DELETE http://localhost:5000/api/projects/<PROJECT_ID>/team-members/<MEMBER_ID>
Authorization: Bearer <TOKEN>
```

---

## 5. 🧪 Error Cases (Test These!)

### **Missing Token**
```http
GET http://localhost:5000/api/auth/profile
```
**Response (401):**
```json
{
  "success": false,
  "message": "No token provided"
}
```

---

### **Invalid Token**
```http
GET http://localhost:5000/api/auth/profile
Authorization: Bearer invalid-token
```
**Response (401):**
```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

---

### **Insufficient Permissions**
```http
POST http://localhost:5000/api/users/invites/create
Authorization: Bearer <STAFF_TOKEN>
Content-Type: application/json

{
  "email": "user@example.com",
  "role": "MANAGER"
}
```
**Response (401):**
```json
{
  "success": false,
  "message": "Insufficient permissions"
}
```

---

### **Validation Error**
```http
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "John",
  "email": "invalid-email",
  "password": "short"
}
```
**Response (400):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email address"
    },
    {
      "field": "password",
      "message": "Password must be at least 8 characters"
    }
  ]
}
```

---

### **Duplicate Email**
```http
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "John Duplicate",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```
**Response (409):**
```json
{
  "success": false,
  "message": "Email already registered"
}
```

---

### **Resource Not Found**
```http
GET http://localhost:5000/api/projects/invalid-id
Authorization: Bearer <TOKEN>
```
**Response (404):**
```json
{
  "success": false,
  "message": "Project not found"
}
```

---

## 6. 📋 Postman Environment Variables

Create Postman environment with:

```json
{
  "baseUrl": "http://localhost:5000",
  "accessToken": "{{save token from login response}}",
  "refreshToken": "{{save refresh token}}",
  "userId": "{{save user ID}}",
  "projectId": "{{save project ID}}",
  "inviteToken": "{{save invite token}}"
}
```

Then use in requests:
```http
GET {{baseUrl}}/api/auth/profile
Authorization: Bearer {{accessToken}}
```

---

## 7. ⚡ Quick Test Sequence

1. ✅ Register new user
2. ✅ Login with credentials
3. ✅ Save accessToken
4. ✅ Get profile
5. ✅ Create project
6. ✅ Get projects
7. ✅ Update project
8. ✅ Add team member
9. ✅ Delete project (soft delete)

---

## 8. 🐛 Common Issues

### **Issue: "No token provided"**
**Fix:** Add `Authorization: Bearer <TOKEN>` header

### **Issue: "Invalid token"**
**Fix:** Make sure token is from recent login (15 min expiry)

### **Issue: "MongoDB connection error"**
**Fix:** Check MONGODB_URI in .env is correct

### **Issue: "Validation failed"**
**Fix:** Check error message for which field is invalid

---

## 9. 📝 Notes

- Access tokens expire in **15 minutes**
- Refresh tokens expire in **7 days**
- Invites expire in **7 days**
- Passwords must meet strength requirements
- All email addresses stored as lowercase
- Soft deleted items are hidden but not removed
