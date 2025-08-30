# Two-Step Registration Flow Example

This shows how users must verify OTP after registration to get access.

## 🔄 **Complete Registration Flow**

### **Step 1: User Registration**
```bash
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "User created successfully. Please check your email for OTP verification.",
  "user": {
    "id": "user_id_here",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "requiresOTPVerification": true
}
```

**What happens:**
- ✅ User account is created in database
- ✅ OTP is generated and sent to email
- ✅ User account exists but is NOT verified
- ❌ User CANNOT access protected routes yet
- ❌ No JWT token provided

---

### **Step 2: OTP Verification (Required!)**
```bash
POST /auth/verify-otp
Content-Type: application/json

{
  "email": "john@example.com",
  "otp": "123456"
}
```

**Response (Success):**
```json
{
  "message": "OTP verified successfully",
  "user": {
    "id": "user_id_here",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "token": "jwt_token_here"
}
```

**What happens:**
- ✅ OTP is verified
- ✅ JWT token is generated and returned
- ✅ User account is now verified
- ✅ User can access protected routes
- ✅ Token is set as HTTP-only cookie

---

## 🚫 **What Happens If User Tries to Access Protected Routes Before OTP Verification?**

### **Attempt to access protected route:**
```bash
GET /api/profile
Authorization: Bearer [no_token]
```

**Response:**
```json
{
  "message": "Access token required",
  "statusCode": 401
}
```

### **Attempt to login before OTP verification:**
```bash
POST /auth/login
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": "user_id_here",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "token": "jwt_token_here"
}
```

**Note:** Login works even without OTP verification, but this is a design choice. You can modify the login to require OTP verification if needed.

---

## 🔧 **Frontend Implementation Example**

### **React/JavaScript Example:**
```javascript
// Step 1: Register user
const handleRegister = async (userData) => {
  try {
    const response = await fetch('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    
    const result = await response.json();
    
    if (result.requiresOTPVerification) {
      // Show OTP input form
      setShowOTPForm(true);
      setUserEmail(userData.email);
    }
  } catch (error) {
    console.error('Registration failed:', error);
  }
};

// Step 2: Verify OTP
const handleOTPVerification = async (otp) => {
  try {
    const response = await fetch('/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: userEmail,
        otp: otp
      })
    });
    
    const result = await response.json();
    
    if (result.token) {
      // Store token and redirect to dashboard
      localStorage.setItem('token', result.token);
      setUser(result.user);
      navigate('/dashboard');
    }
  } catch (error) {
    console.error('OTP verification failed:', error);
  }
};
```

---

## 📱 **Mobile App Flow**

### **Step 1: Registration**
1. User fills registration form
2. App calls `/auth/register`
3. App shows "Check your email for OTP" message
4. App shows OTP input form

### **Step 2: OTP Verification**
1. User enters OTP from email
2. App calls `/auth/verify-otp`
3. App receives JWT token
4. App stores token and proceeds to main app

---

## 🚨 **Security Benefits**

### **Before OTP Verification:**
- ❌ User account exists but unverified
- ❌ No JWT token provided
- ❌ Cannot access protected routes
- ❌ Prevents fake email registrations

### **After OTP Verification:**
- ✅ User account is verified
- ✅ JWT token provided
- ✅ Can access protected routes
- ✅ Email ownership confirmed

---

## 🔄 **Alternative Flows**

### **Resend OTP:**
```bash
POST /auth/resend-otp
{
  "email": "john@example.com"
}
```

### **Send OTP to Existing User:**
```bash
POST /auth/send-otp
{
  "email": "john@example.com"
}
```

---

## ✅ **Summary**

**The two-step registration ensures:**
1. **User account is created** when they register
2. **OTP is sent** to verify email ownership
3. **User must verify OTP** to get JWT token
4. **No access** to protected routes until OTP verified
5. **Security** is maintained throughout the process

This is the **recommended approach** for production applications!



