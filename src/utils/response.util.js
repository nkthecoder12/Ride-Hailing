// Standardized response utility functions
const successResponse = (res, data, message = 'Success', statusCode = 200) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data
    });
};

const errorResponse = (res, message = 'Error occurred', statusCode = 500, errors = null) => {
    const response = {
        success: false,
        message,
        statusCode
    };
    
    if (errors) {
        response.errors = errors;
    }
    
    return res.status(statusCode).json(response);
};

const validationError = (res, errors, message = 'Validation failed') => {
    return errorResponse(res, message, 400, errors);
};

const notFoundError = (res, message = 'Resource not found') => {
    return errorResponse(res, message, 404);
};

const unauthorizedError = (res, message = 'Unauthorized access') => {
    return errorResponse(res, message, 401);
};

const forbiddenError = (res, message = 'Forbidden access') => {
    return errorResponse(res, message, 403);
};

module.exports = {
    successResponse,
    errorResponse,
    validationError,
    notFoundError,
    unauthorizedError,
    forbiddenError
};
