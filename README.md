# myBackend

# Clustered Express Backend

## Overview
This is a high-performance, secure, and scalable Express backend that leverages **clustering and multithreading** to efficiently handle requests. It includes authentication, user management, security enhancements, and integrates OAuth authentication via GitHub.

## Features
- **Cluster and Multithreading**: Utilizes multiple CPU cores to enhance performance.
- **Authentication System**:
  - **Sign In & Sign Up**
  - **Email Verification**
  - **Password Reset**
- **User Management**:
  - **Get User**
  - **Get All Users**
  - **Delete User by ID**
  - **Edit User by ID**
  - **Delete All Users**
- **GitHub OAuth Integration**
- **Security Features**:
  - Helmet for security headers
  - CORS with strict policies
  - XSS protection
  - NoSQL injection protection
  - HTTP parameter pollution prevention
  - CSRF protection
  - Rate limiting for DDoS protection
- **Performance Optimization**:
  - Response compression
  - Worker threads for heavy computation
  - Request logging with Morgan
 
## folder structure
```bash
server/
│── config/             # Configuration settings
|/src
 │── controllers/
 │   ├── public/           # Authentication & OAuth
 │   ├── users/            # User management routes
 │   ├── middleware/       # Authentication middleware
 |   ├── private           # user routes 
 │── models/             # Database models
 │── utils/              # Utility functions (e.g., dbConnect.js)
 │── app.ts           # Main server file with clustering
 │── worker.ts           # Worker thread for heavy tasks

```

## Installation
```bash
# Clone the repository
git clone git@github.com:syedomer17/myBackend.git  ## SSH url 

# Install dependencies
cd your-project
npm install

# Configure cofig foler
cd server
mkdir config
cd config
touch default.json

# Start the server
npm run dev

```

