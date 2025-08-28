const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

// Generate JWT token
const generateToken = (payload, expiresIn = '1h') => {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
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

// Extract token from request
const extractToken = (req) => {
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        return req.headers.authorization.substring(7);
    }
    if (req.cookies && req.cookies.token) {
        return req.cookies.token;
    }
    return null;
};

// Authentication middleware
const authenticateToken = async (req, res, next) => {
    try {
        const token = extractToken(req);
        
        if (!token) {
            return res.status(401).json({ message: 'Access token required' });
        }

        const { success, decoded, error } = verifyToken(token);
        
        if (!success) {
            return res.status(401).json({ message: 'Invalid or expired token' });
        }

        // Get user from database
        const user = await User.findById(decoded.userId).select('-password');
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// Optional authentication middleware (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
    try {
        const token = extractToken(req);
        
        if (token) {
            const { success, decoded } = verifyToken(token);
            
            if (success) {
                const user = await User.findById(decoded.userId).select('-password');
                if (user) {
                    req.user = user;
                }
            }
        }
        
        next();
    } catch (error) {
        // Continue without authentication
        next();
    }
};

module.exports = {
    generateToken,
    verifyToken,
    extractToken,
    authenticateToken,
    optionalAuth
};
