# User Management System (UMS)

A full-stack **MERN** application for user authentication, profile management, and admin operations with JWT authentication, role-based access control, and Docker support.

---

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation & Setup](#installation--setup)
- [Backend Architecture](#backend-architecture)
- [Frontend Architecture](#frontend-architecture)
- [Docker Setup](#docker-setup)
- [Database Schema](#database-schema)
- [ER Diagram](#er-diagram)
- [API Documentation](#api-documentation)
- [Postman Collection](#postman-collection)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Project Overview

The **User Management System (UMS)** is a production-ready web application that provides:

- **User Authentication**: Secure registration and login with JWT tokens (access + refresh)
- **Profile Management**: Users can view, edit, and delete their profiles with image uploads
- **Admin Panel**: Admins can manage all users (view, edit, delete, promote/demote)
- **Role-Based Access**: Protected routes with user and admin roles
- **Search & Filter**: Pagination, search, and role-based filtering
- **Docker Ready**: Fully containerized with Docker Compose

### Core Technology

**Backend**: Node.js + Express + MongoDB (Mongoose)  
**Frontend**: React + Vite + Tailwind CSS v4  
**Authentication**: JWT (access token + refresh token)  
**Storage**: Multer (local file uploads)  
**Security**: Helmet, CORS, Rate Limiting, Bcrypt password hashing

---

## ✨ Features

### Authentication & Authorization
- ✅ User registration with validation (name, email, phone, password, location)
- ✅ Login with email or phone number
- ✅ JWT-based authentication (access token + refresh token)
- ✅ Token refresh mechanism
- ✅ Logout functionality
- ✅ Role-based access control (user/admin)

### User Management
- ✅ View and edit own profile
- ✅ Upload/update profile image (JPG/PNG, max 2MB)
- ✅ Delete own account
- ✅ Update location details (address, state, city, country, pincode)

### Admin Features
- ✅ View all users with pagination
- ✅ Search users by name, email, or phone
- ✅ Filter users by role (user/admin)
- ✅ View detailed user information
- ✅ Edit any user's profile
- ✅ Delete any user account
- ✅ Promote users to admin
- ✅ Demote admins to regular users

### Security & Performance
- ✅ Password hashing with bcrypt
- ✅ HTTP security headers (Helmet)
- ✅ CORS configuration
- ✅ Rate limiting
- ✅ Input validation with Joi
- ✅ Error handling middleware
- ✅ Request logging

### Developer Experience
- ✅ Hot reload (nodemon + Vite HMR)
- ✅ Docker Compose setup
- ✅ Postman collection included
- ✅ Clean folder structure
- ✅ Environment variable configuration

---

## 🛠️ Tech Stack

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 20+ | Runtime environment |
| Express | 5.2.1 | Web framework |
| MongoDB | Latest | Database |
| Mongoose | 8.9.4 | ODM for MongoDB |
| JWT | 9.0.2 | Authentication tokens |
| Bcrypt | 3.0.3 | Password hashing |
| Multer | 2.0.2 | File upload handling |
| Joi | 18.0.2 | Request validation |
| Helmet | 8.1.0 | Security headers |
| CORS | 2.8.5 | Cross-origin resource sharing |
| Rate Limit | 8.2.1 | API rate limiting |
| Nodemon | 3.1.11 | Development auto-reload |

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.2.0 | UI library |
| Vite | 7.2.5 | Build tool & dev server |
| React Router | 7.10.1 | Client-side routing |
| Axios | 1.13.2 | HTTP client |
| React Hook Form | 7.68.0 | Form management |
| Yup | 1.7.1 | Form validation |
| Tailwind CSS | v4 | Styling framework |

### DevOps
| Technology | Version | Purpose |
|------------|---------|---------|
| Docker | Latest | Containerization |
| Docker Compose | 3.8 | Multi-container orchestration |
| Postman | Latest | API testing |

---

## 📦 Installation & Setup

### Prerequisites

- **Node.js**: v20 or higher
- **npm**: v10 or higher
- **MongoDB**: Local installation or MongoDB Atlas account
- **Docker** (optional): For containerized deployment

### 1. Clone Repository

```bash
git clone <repository-url>
cd user_management_system
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file in `backend/` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/user_management_system?retryWrites=true&w=majority

# JWT Configuration
JWT_ACCESS_SECRET=your_access_secret_here_min_32_chars
JWT_REFRESH_SECRET=your_refresh_secret_here_min_32_chars

# CORS Configuration
CORS_ORIGIN=http://localhost:5173

# Admin Setup Key
ADMIN_SETUP_KEY=your_admin_setup_key_here
```

**Generate secure secrets:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create `.env` file in `frontend/` directory (optional):

```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Run Application

**Backend** (Terminal 1):
```bash
cd backend
npm run dev
```
Server runs on: `http://localhost:5000`

**Frontend** (Terminal 2):
```bash
cd frontend
npm run dev
```
Application runs on: `http://localhost:5173`

---

## 🏗️ Backend Architecture

### Folder Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── db.js              # MongoDB connection
│   │   └── constants.js       # App constants
│   ├── controllers/
│   │   ├── authController.js  # Auth logic (register, login, refresh, logout)
│   │   └── userController.js  # User CRUD operations
│   ├── middlewares/
│   │   ├── auth.js            # JWT verification & role checks
│   │   ├── errorHandler.js    # Global error handling
│   │   └── validate.js        # Joi validation wrapper
│   ├── models/
│   │   └── User.js            # User schema & model
│   ├── routes/
│   │   ├── authRoutes.js      # Auth endpoints
│   │   └── userRoutes.js      # User endpoints
│   ├── utils/
│   │   ├── jwt.js             # JWT token generation
│   │   └── response.js        # Standardized responses
│   ├── validation/
│   │   └── userValidation.js  # Joi schemas & multer config
│   └── server.js              # Entry point
├── uploads/
│   └── profile-images/        # Uploaded user images
├── logs/                      # Application logs
├── .env                       # Environment variables
├── Dockerfile                 # Docker image config
└── package.json               # Dependencies
```

### Request Flow

```
Client Request
    ↓
Express Middleware Chain
    ↓
1. Helmet (Security Headers)
2. CORS (Cross-Origin)
3. Rate Limiter (DOS Protection)
4. Body Parser (JSON/Form-data)
    ↓
Route Handler
    ↓
5. Auth Middleware (JWT Verification)
6. Validation Middleware (Joi Schema)
7. Multer (File Upload - if applicable)
    ↓
Controller Function
    ↓
8. Business Logic
9. Database Operations (Mongoose)
    ↓
Response
    ↓
10. Standardized JSON Response
11. Error Handler (if error occurs)
    ↓
Client
```

### Authentication Flow

**Access Token**: Short-lived (15 minutes), stored in `localStorage`  
**Refresh Token**: Long-lived (7 days), stored in `localStorage`

```
1. Login → Backend generates both tokens
2. Frontend stores tokens in localStorage
3. Every request includes access token in Authorization header
4. If access token expires → Use refresh token to get new tokens
5. If refresh token expires → User must login again
```

### Middleware Pipeline

**Protected Routes**:
```javascript
protect → verifies JWT access token → attaches user to req.user
adminOnly → checks if req.user.role === 'admin'
```

**File Uploads**:
```javascript
uploadProfileImage → Multer middleware
    ↓
Validates: File type (JPG/PNG), Size (max 2MB)
    ↓
Saves to: backend/uploads/profile-images/
    ↓
Returns: filename for database storage
```

---

## 🎨 Frontend Architecture

### Folder Structure

```
frontend/
├── public/
│   └── favicon.svg            # Browser icon
├── src/
│   ├── assets/                # Static assets
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.jsx     # Reusable button
│   │   │   ├── Input.jsx      # Form input with validation
│   │   │   ├── Pagination.jsx # Pagination controls
│   │   │   └── Toast.jsx      # Notification component
│   │   ├── AdminRoute.jsx     # Admin-only route guard
│   │   └── ProtectedRoute.jsx # Auth route guard
│   ├── config/
│   │   └── api.js             # Axios instance with interceptors
│   ├── context/
│   │   └── AuthContext.jsx    # Global auth state
│   ├── pages/
│   │   ├── AdminPanel.jsx     # Admin user management
│   │   ├── EditProfile.jsx    # Edit user profile
│   │   ├── Login.jsx          # Login page
│   │   ├── Profile.jsx        # User profile view
│   │   ├── Register.jsx       # Registration page
│   │   └── UserDetail.jsx     # View user details
│   ├── utils/
│   │   └── imageHelper.js     # Image URL helper
│   ├── App.jsx                # Root component with routes
│   ├── main.jsx               # Entry point
│   └── index.css              # Global styles (Tailwind)
├── .env                       # Environment variables
├── Dockerfile                 # Docker image config
├── index.html                 # HTML template
├── vite.config.js             # Vite configuration
└── package.json               # Dependencies
```

### Token Handling

**Axios Interceptor** (`config/api.js`):

```javascript
// Request Interceptor
- Automatically adds Authorization header: Bearer <accessToken>
- Detects FormData and removes Content-Type (let browser set boundary)

// Response Interceptor
- Catches 401 errors (token expired)
- Automatically calls refresh token endpoint
- Retries original request with new token
- Redirects to login if refresh fails
```

### Admin Panel Features

**User Table**:
- Click row → View user details
- Edit button → Edit user profile
- Delete button → Delete user (with confirmation)
- Promote/Demote buttons → Change user role

**Search & Filter**:
- Search by: name, email, phone
- Filter by: role (all/user/admin)
- Pagination: 10 users per page
- Real-time updates after edits

**Auto-Refresh**:
- Refetches data when returning from edit page
- Uses Visibility API to detect tab focus

---

## 🐳 Docker Setup

### Docker Compose Services

```yaml
services:
  backend:
    - Port: 5000
    - Hot reload enabled (volume mount)
    - Health check: /health endpoint
    
  frontend:
    - Port: 5173
    - Hot reload enabled (volume mount)
    - Depends on backend
```

### Build & Run

**Start all services:**
```bash
docker-compose up -d
```

**View logs:**
```bash
docker-compose logs -f
docker logs ums-backend-dev
docker logs ums-frontend-dev
```

**Stop services:**
```bash
docker-compose down
```

**Rebuild after code changes:**
```bash
docker-compose up --build
```

**Check service status:**
```bash
docker-compose ps
```

### Accessing Services

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:5000
- **API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/health

### Volumes

```yaml
Backend Volumes:
  - ./backend/src:/app/src           # Source code hot reload
  - ./backend/uploads:/app/uploads   # Persistent file uploads
  - ./backend/logs:/app/logs         # Persistent logs

Frontend Volumes:
  - ./frontend/src:/app/src          # Source code hot reload
```

---

## 🗄️ Database Schema

### User Model

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `_id` | ObjectId | Auto | - | MongoDB unique ID |
| `name` | String | No | - | User's full name |
| `email` | String | No | - | User's email (unique) |
| `phone` | String | No | - | User's phone (unique, 10-15 digits) |
| `password` | String | Yes | - | Hashed password (bcrypt) |
| `profile_image` | String | No | null | Path to profile image |
| `address` | String | No | null | Full address |
| `state` | String | No | - | State name |
| `city` | String | No | - | City name |
| `country` | String | No | - | Country name |
| `pincode` | String | No | - | Postal code (4-10 digits) |
| `role` | String (enum) | Yes | 'user' | User role: 'user' or 'admin' |
| `createdAt` | Date | Auto | now | Account creation timestamp |
| `updatedAt` | Date | Auto | now | Last update timestamp |

### Validation Rules

**Registration**:
- Name: Min 3 chars, alphabets only
- Email: Valid email format OR
- Phone: 10-15 digits (at least one of email/phone required)
- Password: Min 6 chars, at least 1 number
- State, City, Country: Required
- Pincode: 4-10 digits
- Profile Image: JPG/PNG, max 2MB

**Login**:
- Identifier: Email or phone
- Password: Required

### Indexes

```javascript
email: unique, sparse
phone: unique, sparse
```

### Password Security

- **Hashing**: Bcrypt with salt rounds = 10
- **Storage**: `select: false` (excluded from queries by default)
- **Comparison**: Uses `comparePassword()` method

---

## 📊 ER Diagram

```
┌─────────────────────────────────────────┐
│              USER                       │
├─────────────────────────────────────────┤
│ PK  _id                                 │
│     name                                │
│ UQ  email                               │
│ UQ  phone                               │
│     password (hashed)                   │
│     profile_image                       │
│     address                             │
│     state                               │
│     city                                │
│     country                             │
│     pincode                             │
│     role (user/admin)                   │
│     createdAt                           │
│     updatedAt                           │
└─────────────────────────────────────────┘
```

---

## 🔌 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication

All protected routes require JWT token in Authorization header:
```
Authorization: Bearer <accessToken>
```

---

### 🔐 Authentication Endpoints

#### 1. Register User
```http
POST /auth/register
Content-Type: multipart/form-data
```

**Body (form-data)**:
```
name: John Doe
email: john@example.com
phone: 9876543210
password: Test@123
state: Karnataka
city: Bangalore
country: India
pincode: 560001
address: 123 Main Street (optional)
profile_image: [file] (optional, max 2MB, JPG/PNG)
```

**Success Response (201)**:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "9876543210",
      "role": "user",
      "createdAt": "2025-12-07T10:00:00.000Z"
    },
    "tokens": {
      "accessToken": "eyJhbGc...",
      "refreshToken": "eyJhbGc..."
    }
  }
}
```

**Error Response (400)**:
```json
{
  "success": false,
  "error": {
    "message": "Email already exists",
    "statusCode": 400
  }
}
```

---

#### 2. Login
```http
POST /auth/login
Content-Type: application/json
```

**Body (JSON)**:
```json
{
  "identifier": "john@example.com",
  "password": "Test@123"
}
```

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "tokens": {
      "accessToken": "eyJhbGc...",
      "refreshToken": "eyJhbGc..."
    }
  }
}
```

---

#### 3. Refresh Token
```http
POST /auth/refresh
Content-Type: application/json
```

**Body (JSON)**:
```json
{
  "refreshToken": "eyJhbGc..."
}
```

**Success Response (200)**:
```json
{
  "success": true,
  "data": {
    "tokens": {
      "accessToken": "eyJhbGc...",
      "refreshToken": "eyJhbGc..."
    }
  }
}
```

---

#### 4. Logout
```http
POST /auth/logout
Authorization: Bearer <accessToken>
Content-Type: application/json
```

**Body (JSON)**:
```json
{
  "refreshToken": "eyJhbGc..."
}
```

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

### 👤 User Endpoints

#### 5. Get My Profile
```http
GET /users/profile/me
Authorization: Bearer <accessToken>
```

**Success Response (200)**:
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "9876543210",
      "profile_image": "uploads/profile-images/profile-123.jpg",
      "state": "Karnataka",
      "city": "Bangalore",
      "country": "India",
      "pincode": "560001",
      "address": "123 Main Street",
      "role": "user",
      "createdAt": "2025-12-07T10:00:00.000Z",
      "updatedAt": "2025-12-07T10:00:00.000Z"
    }
  }
}
```

---

#### 6. Update Profile
```http
PUT /users/:id
Authorization: Bearer <accessToken>
Content-Type: multipart/form-data
```

**Body (form-data)**:
```
name: John Updated
phone: 1234567890
state: Maharashtra
city: Mumbai
country: India
pincode: 400001
address: 456 New Street
profile_image: [file] (optional)
```

**Success Response (200)**:
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "user": { ... }
  }
}
```

---

#### 7. Delete Account
```http
DELETE /users/:id
Authorization: Bearer <accessToken>
```

**Success Response (200)**:
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

---

### 👨‍💼 Admin Endpoints

#### 8. Get All Users
```http
GET /users?page=1&limit=10&search=john&role=user
Authorization: Bearer <accessToken> (Admin only)
```

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `search`: Search by name/email/phone
- `role`: Filter by role (user/admin)

**Success Response (200)**:
```json
{
  "success": true,
  "data": {
    "users": [ ... ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalUsers": 50,
      "limit": 10,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

---

#### 9. Get User by ID
```http
GET /users/:id
Authorization: Bearer <accessToken>
```

**Success Response (200)**:
```json
{
  "success": true,
  "data": {
    "user": { ... }
  }
}
```

---

#### 10. Promote to Admin
```http
PATCH /users/:id/promote-admin
Authorization: Bearer <accessToken> (Admin only)
```

**Success Response (200)**:
```json
{
  "success": true,
  "message": "User promoted to admin successfully",
  "data": {
    "user": {
      "_id": "...",
      "role": "admin"
    }
  }
}
```

---

#### 11. Demote from Admin
```http
PATCH /users/:id/demote-admin
Authorization: Bearer <accessToken> (Admin only)
```

**Success Response (200)**:
```json
{
  "success": true,
  "message": "User demoted to user successfully",
  "data": {
    "user": {
      "_id": "...",
      "role": "user"
    }
  }
}
```

---

#### 12. Setup Admin (First Time)
```http
POST /users/setup-admin
Authorization: Bearer <accessToken>
Content-Type: application/json
```

**Body (JSON)**:
```json
{
  "adminSetupKey": "your_admin_setup_key_from_env"
}
```

**Success Response (200)**:
```json
{
  "success": true,
  "message": "User promoted to admin successfully"
}
```

---

### 🏥 Health Check

#### Health Endpoint
```http
GET /health
```

**Success Response (200)**:
```json
{
  "status": "OK",
  "timestamp": "2025-12-07T10:00:00.000Z",
  "uptime": 12345.67
}
```

---

### Error Responses

All errors follow this format:
```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "statusCode": 400,
    "errors": [ ... ] // Validation errors
  }
}
```

**Common Status Codes**:
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (invalid/missing token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found (resource doesn't exist)
- `429`: Too Many Requests (rate limit exceeded)
- `500`: Internal Server Error

---

## 📮 Postman Collection

### Import Collection

1. Open Postman
2. Click **Import** button
3. Select `UMS_API_Collection.postman_collection.json` from project root
4. Collection appears in left sidebar

### Collection Structure

```
UMS API Collection/
├── Authentication/
│   ├── Register User
│   ├── Login
│   ├── Refresh Token
│   └── Logout
├── User Profile/
│   ├── Get My Profile
│   ├── Update My Profile
│   └── Delete My Account
├── Admin - User Management/
│   ├── Get All Users
│   ├── Get User by ID
│   ├── Update User (Admin)
│   ├── Delete User (Admin)
│   ├── Promote to Admin
│   ├── Demote from Admin
│   └── Setup Admin (First Time)
└── Health Check
```

### Pre-configured Features

✅ **Auto Token Management**: Login/Register requests automatically save tokens  
✅ **Collection Variables**: `{{baseUrl}}`, `{{accessToken}}`, `{{userId}}`  
✅ **Bearer Auth**: Protected routes use saved access token  
✅ **Test Scripts**: Auto-save tokens after successful authentication  
✅ **Form Data**: Image upload examples included  

### Usage

1. **Set Base URL**: Edit collection variables if needed
2. **Register/Login**: Run "Login" request first
3. **Tokens Auto-Save**: Access token saved for subsequent requests
4. **Test Endpoints**: All protected routes work automatically
5. **Token Refresh**: Use "Refresh Token" when access token expires

### Collection Variables

```
baseUrl: http://localhost:5000/api
accessToken: (auto-saved from login/register)
refreshToken: (auto-saved from login/register)
userId: (auto-saved from login/register)
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. CORS Errors

**Error**: `Access to XMLHttpRequest has been blocked by CORS policy`

**Solution**:
- Check `CORS_ORIGIN` in backend `.env` matches frontend URL
- Default: `CORS_ORIGIN=http://localhost:5173`
- For production: Set to your frontend domain

```env
# Backend .env
CORS_ORIGIN=http://localhost:5173
```

---

#### 2. MongoDB Connection Failed

**Error**: `MongooseServerSelectionError: connect ECONNREFUSED`

**Solutions**:

**Local MongoDB**:
```env
MONGODB_URI=mongodb://localhost:27017/user_management_system
```

**MongoDB Atlas**:
- Check cluster is running (free tier auto-pauses)
- Verify IP whitelist includes your IP (or use 0.0.0.0/0 for all IPs)
- Check username/password are correct
- Ensure network access is configured

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority
```

---

#### 3. JWT Token Invalid

**Error**: `JsonWebTokenError: invalid token`

**Solutions**:
- Token expired → Use refresh token endpoint
- Token malformed → Login again to get new token
- Secret changed → All existing tokens are invalid, re-login

**Frontend**: Clear localStorage and login again
```javascript
localStorage.clear();
window.location.href = '/login';
```

---

#### 4. File Upload Errors

**Error**: `File too large` or `Invalid file type`

**Solutions**:
- Max file size: 2MB
- Allowed types: JPG, PNG only
- Check multer configuration in `backend/src/validation/userValidation.js`

**Test upload**:
```bash
# Check uploads directory exists
ls backend/uploads/profile-images/
```

---

#### 5. Port Already in Use

**Error**: `Error: listen EADDRINUSE: address already in use :::5000`

**Solutions**:

**Windows**:
```bash
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

**Linux/Mac**:
```bash
lsof -ti:5000 | xargs kill -9
```

**Or change port** in `.env`:
```env
PORT=5001
```

---

#### 6. Docker Issues

**Container keeps restarting**:
```bash
docker logs ums-backend-dev
docker logs ums-frontend-dev
```

**MongoDB connection timeout in Docker**:
- MongoDB Atlas may block Docker container IP
- Add 0.0.0.0/0 to IP whitelist in Atlas
- Or use local MongoDB in docker-compose

**Clean Docker**:
```bash
docker-compose down -v
docker system prune -a
docker-compose up --build
```

---

#### 7. Frontend Build Errors

**Error**: `Module not found` or `Cannot find module`

**Solution**:
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

---

#### 8. Admin Setup Key Not Working

**Error**: `Invalid admin setup key`

**Solution**:
- Check `ADMIN_SETUP_KEY` in backend `.env`
- Use exact key from `.env` in request body
- Key is case-sensitive

---

### Development Tips

**Hot Reload Not Working**:
- Check volume mounts in `docker-compose.yml`
- Restart containers: `docker-compose restart`

**Database Reset**:
```bash
# MongoDB Shell
mongosh
use user_management_system
db.users.deleteMany({})
```

**View Logs**:
```bash
# Backend logs
docker logs -f ums-backend-dev

# Frontend logs
docker logs -f ums-frontend-dev
```

**Clear Browser Cache**:
- Press `Ctrl + Shift + R` (hard refresh)
- Clear localStorage in DevTools

---

## 📧 Contact

For questions or support, please open an issue in the repository.

---

**Made with ❤️ using MERN Stack**
