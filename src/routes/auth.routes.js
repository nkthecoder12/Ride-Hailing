const express = require('express');
const router = express.Router();
const { 
    register,              // Two-step registration (create user + send OTP)       // One-step registration (create user + verify OTP + get JWT)
    login, 
    logout, 
    sendOTP, 
    verifyOTP, 
    resendOTP 
} = require('../controllers/auth.controller');

// Registration flow
router.post('/register', register);                    // Step 1: Create user + send OTP
   // Alternative: One-step registration

// OTP verification (required after registration)
router.post('/verify-otp', verifyOTP);                // Step 2: Verify OTP + get JWT token

// OTP management
router.post('/send-otp', sendOTP);                    // Send OTP to email
router.post('/resend-otp', resendOTP);                // Resend OTP

// Authentication
router.post('/login', login);
router.post('/logout', logout);

module.exports = router;
