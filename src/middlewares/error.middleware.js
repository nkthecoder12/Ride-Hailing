const { errorResponse } = require('../utils/response.util');

// Global error handling middleware
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    // Default error
    let statusCode = 500;
    let message = 'Internal server error';

    // Handle specific error types
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = 'Validation failed';
        const errors = Object.values(err.errors).map(error => error.message);
        return errorResponse(res, message, statusCode, errors);
    }

    if (err.name === 'CastError') {
        statusCode = 400;
        message = 'Invalid ID format';
    }

    if (err.code === 11000) {
        statusCode = 400;
        message = 'Duplicate field value';
    }

    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token';
    }

    if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token expired';
    }

    // Send error response
    errorResponse(res, message, statusCode);
};

// 404 handler for undefined routes
const notFound = (req, res) => {
    errorResponse(res, 'Route not found', 404);
};

module.exports = {
    errorHandler,
    notFound
};
