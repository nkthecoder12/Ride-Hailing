const { authenticateToken, optionalAuth } = require('../utils/jwt.util');
const { unauthorizedError } = require('../utils/response.util');

// Middleware to require authentication
const requireAuth = async (req, res, next) => {
    try {
        await authenticateToken(req, res, next);
    } catch (error) {
        return unauthorizedError(res, 'Authentication required');
    }
};

// Middleware for optional authentication (doesn't fail if no token)
const optionalAuthentication = async (req, res, next) => {
    try {
        await optionalAuth(req, res, next);
    } catch (error) {
        // Continue without authentication
        next();
    }
};

// Role-based access control middleware
const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return unauthorizedError(res, 'Authentication required');
        }

        if (!roles.includes(req.user.role)) {
            return unauthorizedError(res, 'Insufficient permissions');
        }

        next();
    };
};

// Admin access middleware
const requireAdmin = requireRole(['admin']);

// User access middleware (user can access their own data or admin can access all)
const requireUserOrAdmin = (req, res, next) => {
    if (!req.user) {
        return unauthorizedError(res, 'Authentication required');
    }

    const userId = req.params.userId || req.params.id;
    
    if (req.user.role === 'admin' || req.user._id.toString() === userId) {
        next();
    } else {
        return unauthorizedError(res, 'Access denied');
    }
};

module.exports = {
    requireAuth,
    optionalAuthentication,
    requireRole,
    requireAdmin,
    requireUserOrAdmin
};
