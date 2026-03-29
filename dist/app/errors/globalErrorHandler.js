"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const http_status_1 = __importDefault(require("http-status"));
const zod_1 = require("zod");
const config_1 = __importDefault(require("../../config"));
const uuid_1 = require("uuid");
// Security-focused error logging
const logSecurityError = (error, req, errorId) => {
    var _a;
    const logData = {
        errorId,
        timestamp: new Date().toISOString(),
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id,
        errorType: error.constructor.name,
        message: error.message,
        stack: config_1.default.env !== 'production' ? error.stack : undefined
    };
    // In production, you might want to send this to a logging service
    // like CloudWatch, Sentry, or similar
};
const handleClientError_1 = __importDefault(require("./handleClientError"));
const handleZodError_1 = __importDefault(require("./handleZodError"));
const handleValidationError_1 = __importDefault(require("./handleValidationError"));
const ApiError_1 = __importDefault(require("./ApiError"));
const GlobalErrorHandler = (error, req, res, next) => {
    const errorId = (0, uuid_1.v4)(); // Generate unique error ID for tracking
    let statusCode = http_status_1.default.INTERNAL_SERVER_ERROR;
    let message = error.message || "Something went wrong!";
    let errorMessages = [];
    let shouldLogError = true;
    // Log security-related errors
    if (statusCode >= 400) {
        logSecurityError(error, req, errorId);
    }
    // handle prisma client validation errors
    if (error instanceof client_1.Prisma.PrismaClientValidationError) {
        const simplifiedError = (0, handleValidationError_1.default)(error);
        statusCode = simplifiedError.statusCode;
        message = simplifiedError.message;
        errorMessages = simplifiedError.errorMessages;
    }
    // Handle Zod Validation Errors
    else if (error instanceof zod_1.ZodError) {
        const simplifiedError = (0, handleZodError_1.default)(error);
        statusCode = simplifiedError.statusCode;
        message = simplifiedError.message;
        errorMessages = simplifiedError.errorMessages;
    }
    // Handle Prisma Client Known Request Errors
    else if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
        const simplifiedError = (0, handleClientError_1.default)(error);
        statusCode = simplifiedError.statusCode;
        message = simplifiedError.message;
        errorMessages = simplifiedError.errorMessages;
    }
    // Handle Custom ApiError
    else if (error instanceof ApiError_1.default) {
        statusCode = error === null || error === void 0 ? void 0 : error.statusCode;
        message = error.message;
        errorMessages = (error === null || error === void 0 ? void 0 : error.message)
            ? [
                {
                    path: "",
                    message: error === null || error === void 0 ? void 0 : error.message,
                },
            ]
            : [];
    }
    // Handle Errors
    else if (error instanceof Error) {
        message = error === null || error === void 0 ? void 0 : error.message;
        errorMessages = (error === null || error === void 0 ? void 0 : error.message)
            ? [
                {
                    path: "",
                    message: error === null || error === void 0 ? void 0 : error.message,
                },
            ]
            : [];
    }
    // Prisma Client Initialization Error
    else if (error instanceof client_1.Prisma.PrismaClientInitializationError) {
        statusCode = http_status_1.default.INTERNAL_SERVER_ERROR;
        message =
            "Failed to initialize Prisma Client. Check your database connection or Prisma configuration.";
        errorMessages = [
            {
                path: "",
                message: "Failed to initialize Prisma Client.",
            },
        ];
    }
    // Prisma Client Rust Panic Error
    else if (error instanceof client_1.Prisma.PrismaClientRustPanicError) {
        statusCode = http_status_1.default.INTERNAL_SERVER_ERROR;
        message =
            "A critical error occurred in the Prisma engine. Please try again later.";
        errorMessages = [
            {
                path: "",
                message: "Prisma Client Rust Panic Error",
            },
        ];
    }
    // Prisma Client Unknown Request Error
    else if (error instanceof client_1.Prisma.PrismaClientUnknownRequestError) {
        statusCode = http_status_1.default.INTERNAL_SERVER_ERROR;
        message = "An unknown error occurred while processing the request.";
        errorMessages = [
            {
                path: "",
                message: "Prisma Client Unknown Request Error",
            },
        ];
    }
    // Generic Error Handling (e.g., JavaScript Errors)
    else if (error instanceof SyntaxError) {
        statusCode = http_status_1.default.BAD_REQUEST;
        message = "Syntax error in the request. Please verify your input.";
        errorMessages = [
            {
                path: "",
                message: "Syntax Error",
            },
        ];
    }
    else if (error instanceof TypeError) {
        statusCode = http_status_1.default.BAD_REQUEST;
        message = "Type error in the application. Please verify your input.";
        errorMessages = [
            {
                path: "",
                message: "Type Error",
            },
        ];
    }
    else if (error instanceof ReferenceError) {
        statusCode = http_status_1.default.BAD_REQUEST;
        message = "Reference error in the application. Please verify your input.";
        errorMessages = [
            {
                path: "",
                message: "Reference Error",
            },
        ];
    }
    // Catch any other error type
    else {
        message = "An unexpected error occurred!";
        errorMessages = [
            {
                path: "",
                message: "An unexpected error occurred!",
            },
        ];
    }
    // Prepare response based on environment
    const response = {
        success: false,
        message: config_1.default.env === 'production'
            ? sanitizeErrorMessage(message, statusCode)
            : message,
        errorId,
        timestamp: new Date().toISOString()
    };
    // Only include detailed error information in development
    if (config_1.default.env !== 'production') {
        response.errorMessages = errorMessages;
        response.stack = error === null || error === void 0 ? void 0 : error.stack;
    }
    else {
        // In production, only include minimal error info to prevent information disclosure
        if (statusCode >= 500) {
            response.message = 'Internal server error. Please contact support.';
        }
    }
    // Security headers for error responses
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.status(statusCode).json(response);
};
// Sanitize error messages for production
const sanitizeErrorMessage = (message, statusCode) => {
    // Map of safe error messages for production
    const safeMessages = {
        400: 'Bad request. Please check your input.',
        401: 'Authentication required.',
        403: 'Access denied.',
        404: 'Resource not found.',
        409: 'Conflict occurred.',
        422: 'Invalid input data.',
        429: 'Too many requests. Please try again later.',
        500: 'Internal server error.',
        502: 'Service temporarily unavailable.',
        503: 'Service unavailable.',
    };
    return safeMessages[statusCode] || 'An error occurred.';
};
exports.default = GlobalErrorHandler;
