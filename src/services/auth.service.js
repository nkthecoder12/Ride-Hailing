const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
// Generate OTP
const transporter = require('../transporter');

const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP to user email
const sendOTP = async (email, otp) => {
   
    const fromAddress = process.env.SENDER_EMAIL || process.env.SMTP_USER;
    console.log('[Mail] Using from address:', fromAddress, '→ to:', email);

    const mailOptions = {
        from: fromAddress,
        to: email,
        subject: 'OTP Verification',
        text: `Your OTP for verification is: ${otp}. This OTP will expire in 10 minutes.`
    };
    
    try {
        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Error sending OTP email:', error && (error.response || error.message || error));
        return false;
    }
};

// Generate and save OTP for user
const generateAndSaveOTP = async (email) => {
    try {
        const user = await User.findOne({ email });
        if (!user) {
            throw new Error('User not found');
        }

        const otp = generateOTP();
        const otpExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

        user.verifyotp = otp;
        user.verifyotpExpire = otpExpire;
        await user.save();

        // Send OTP via email
        const emailSent = await sendOTP(email, otp);
        if (!emailSent) {
            throw new Error('Failed to send OTP email');
        }

        return { success: true, message: 'OTP sent successfully' };
    } catch (error) {
        throw error;
    }
};

// Verify OTP
const verifyOTP = async (email, otp) => {
    try {
        const user = await User.findOne({ email });
        if (!user) {
            throw new Error('User not found');
        }

        if (user.verifyotp !== otp) {
            throw new Error('Invalid OTP');
        }

        if (Date.now() > user.verifyotpExpire) {
            throw new Error('OTP has expired');
        }

        // Clear OTP after successful verification
        user.verifyotp = '';
        user.verifyotpExpire = 0;
        await user.save();

        return { success: true, message: 'OTP verified successfully', user };
    } catch (error) {
        throw error;
    }
};

// Generate JWT token
const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// Verify JWT token
const verifyToken = (token) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return { success: true, decoded };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

module.exports = {
    generateAndSaveOTP,
    verifyOTP,
    generateToken,
    verifyToken
};
