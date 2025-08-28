# Ride Hailing Project - Authentication System

This project implements a complete authentication system with OTP verification and JWT token management.

## Features

- **User Registration**: Creates user account and sends OTP via email
- **OTP Verification**: 6-digit OTP verification system with 10-minute expiration
- **JWT Authentication**: Secure token-based authentication
- **Email Integration**: Nodemailer integration for OTP delivery
- **Role-based Access Control**: Middleware for protecting routes
- **Error Handling**: Comprehensive error handling and validation

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
JWT_SECRET=your_jwt_secret_key_here
SMTP_USER=your_gmail_address@gmail.com
SMTP_PASS=your_gmail_app_password
SENDER_EMAIL=your_gmail_address@gmail.com
NODE_ENV=development
```

## API Endpoints

### Authentication Routes

- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `POST /auth/send-otp` - Send OTP to email
- `POST /auth/verify-otp` - Verify OTP and get JWT token
- `POST /auth/resend-otp` - Resend OTP

### Request/Response Examples

#### Register User
```json
POST /auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Send OTP
```json
POST /auth/send-otp
{
  "email": "john@example.com"
}
```

#### Verify OTP
```json
POST /auth/verify-otp
{
  "email": "john@example.com",
  "otp": "123456"
}
```

#### Login
```json
POST /auth/login
{
  "email": "john@example.com",
  "password": "password123"
}
```

## JWT Middleware

### Protecting Routes

```javascript
const { requireAuth, requireAdmin } = require('./middlewares/auth.middleware');

// Route requiring authentication
router.get('/profile', requireAuth, (req, res) => {
    // req.user contains the authenticated user
    res.json({ user: req.user });
});

// Route requiring admin role
router.get('/admin', requireAdmin, (req, res) => {
    res.json({ message: 'Admin access granted' });
});
```

### Available Middleware

- `requireAuth` - Requires valid JWT token
- `optionalAuthentication` - Optional authentication (doesn't fail if no token)
- `requireRole(roles)` - Role-based access control
- `requireAdmin` - Admin-only access
- `requireUserOrAdmin` - User can access own data, admin can access all

## OTP System

- **OTP Generation**: 6-digit random number
- **Expiration**: 10 minutes from generation
- **Storage**: Stored in user document with expiration timestamp
- **Email Delivery**: Sent via Nodemailer (Gmail)
- **Verification**: Clears OTP after successful verification

## JWT Token System

- **Token Generation**: Uses user ID as payload
- **Expiration**: 1 hour default (configurable)
- **Storage**: HTTP-only cookies for security
- **Verification**: Middleware for route protection
- **Extraction**: Supports both Authorization header and cookies

## Project Structure

```
src/
├── controllers/
│   └── auth.controller.js      # Authentication logic
├── middlewares/
│   ├── auth.middleware.js      # Authentication middleware
│   └── error.middleware.js     # Error handling
├── models/
│   └── user.model.js           # User schema with OTP fields
├── routes/
│   └── auth.routes.js          # Authentication routes
├── services/
│   └── auth.service.js         # OTP and JWT business logic
├── utils/
│   ├── jwt.util.js             # JWT utilities
│   └── response.util.js        # Standardized responses
└── transporter.js               # Email configuration
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables

3. Start the server:
```bash
npm start
```

## Testing

Run the test file to verify functionality:
```bash
node tests/otp.test.js
```

## Security Features

- HTTP-only cookies for JWT storage
- Secure cookie settings in production
- Password hashing with bcryptjs
- OTP expiration and single-use
- Role-based access control
- Input validation and sanitization

## Error Handling

The system includes comprehensive error handling for:
- Validation errors
- Authentication failures
- OTP expiration
- Invalid tokens
- Database errors
- Email delivery failures
