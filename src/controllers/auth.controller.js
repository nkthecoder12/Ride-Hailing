const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const { generateAndSaveOTP, verifyOTP: verifyOTPService, generateToken } = require('../services/auth.service');

// Two-step registration: create user + send OTP (user must verify OTP to get JWT)
const register = async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }
    
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ name, email, password: hashedPassword });
        await user.save();
        
      
        try {
            await generateAndSaveOTP(email);
            res.status(201).json({ 
                message: 'User created successfully. Please check your email for OTP verification.', 
                user: { id: user._id, name: user.name, email: user.email },
                requiresOTPVerification: true
            });
        } catch (otpError) {
            // User created but OTP failed - still return success but warn about OTP
            res.status(201).json({ 
                message: 'User created successfully but OTP verification failed. Please try again later.', 
                user: { id: user._id, name: user.name, email: user.email },
                requiresOTPVerification: true
            });
        }
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};



const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }
    
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }
        
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: 'Invalid password' });
        }
        
        const token = generateToken({ userId: user._id });
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days
        });
        
        res.status(200).json({ 
            message: 'Login successful', 
            user: { id: user._id, name: user.name, email: user.email },
            token
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const logout = async (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
    });
    res.status(200).json({ message: 'User logged out successfully' });
};

// Generate and send OTP
const sendOTP = async (req, res) => {
    const { email } = req.body;
    
    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }
    
    try {
        const result = await generateAndSaveOTP(email);
        res.status(200).json({ message: 'OTP sent successfully' });
    } catch (error) {
        console.error('Send OTP error:', error);
        res.status(400).json({ message: error.message });
    }
};

// Verify OTP
const verifyOTP = async (req, res) => {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
        return res.status(400).json({ message: 'Email and OTP are required' });
    }
    
    try {
        const result = await verifyOTPService(email, otp);
        
        if (result.success) {
       
            const token = generateToken({ userId: result.user._id });
            
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days
            });
            
            res.status(200).json({ 
                message: 'OTP verified successfully', 
                user: { id: result.user._id, name: result.user.name, email: result.user.email },
                token
            });
        } else {
            res.status(400).json({ message: result.message });
        }
    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(400).json({ message: error.message });
    }
};

// Resend OTP
const resendOTP = async (req, res) => {
    const { email } = req.body;
    
    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }
    
    try {
        const result = await generateAndSaveOTP(email);
        res.status(200).json({ message: 'OTP resent successfully' });
    } catch (error) {
        console.error('Resend OTP error:', error);
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    register,              // Two-step registration (create user + send OTP)
    login,
    logout,
    sendOTP,
    verifyOTP,
    resendOTP
};

