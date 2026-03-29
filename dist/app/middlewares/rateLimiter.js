"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanup = exports.authenticatedRateLimit = exports.adminRateLimit = exports.fileUploadRateLimit = exports.otpRateLimit = exports.speedLimiter = exports.passwordResetRateLimit = exports.loginRateLimit = exports.authRateLimit = exports.generalRateLimit = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const express_slow_down_1 = __importDefault(require("express-slow-down"));
const security_1 = __importDefault(require("../../config/security"));
// General API rate limiter (uses default IP handling)
exports.generalRateLimit = (0, express_rate_limit_1.default)(Object.assign(Object.assign({}, security_1.default.rateLimiting.general), { handler: (req, res) => {
        res.status(429).json({
            success: false,
            message: security_1.default.rateLimiting.general.message.error,
            error: {
                type: 'RATE_LIMIT_EXCEEDED',
                retryAfter: Math.ceil(security_1.default.rateLimiting.general.windowMs / 1000),
            }
        });
    }, skip: (req) => {
        // Skip rate limiting for health checks
        return req.path === '/health' || req.path === '/';
    } }));
// Authentication endpoints rate limiter (uses default IP handling)
exports.authRateLimit = (0, express_rate_limit_1.default)(Object.assign(Object.assign({}, security_1.default.rateLimiting.auth), { handler: (req, res) => {
        res.status(429).json({
            success: false,
            message: security_1.default.rateLimiting.auth.message.error,
            error: {
                type: 'AUTH_RATE_LIMIT_EXCEEDED',
                retryAfter: Math.ceil(security_1.default.rateLimiting.auth.windowMs / 1000),
            }
        });
    } }));
// Login specific rate limiter (uses default IP handling)
exports.loginRateLimit = (0, express_rate_limit_1.default)(Object.assign(Object.assign({}, security_1.default.rateLimiting.login), { handler: (req, res) => {
        res.status(429).json({
            success: false,
            message: security_1.default.rateLimiting.login.message.error,
            error: {
                type: 'LOGIN_RATE_LIMIT_EXCEEDED',
                retryAfter: Math.ceil(security_1.default.rateLimiting.login.windowMs / 1000),
                hint: 'Too many failed login attempts. Please try again later or reset your password.'
            }
        });
    } }));
// Password reset rate limiter (uses default IP handling)
exports.passwordResetRateLimit = (0, express_rate_limit_1.default)(Object.assign(Object.assign({}, security_1.default.rateLimiting.passwordReset), { handler: (req, res) => {
        res.status(429).json({
            success: false,
            message: security_1.default.rateLimiting.passwordReset.message.error,
            error: {
                type: 'PASSWORD_RESET_RATE_LIMIT_EXCEEDED',
                retryAfter: Math.ceil(security_1.default.rateLimiting.passwordReset.windowMs / 1000),
            }
        });
    } }));
// Slow down middleware for progressive delays (uses default IP handling)
exports.speedLimiter = (0, express_slow_down_1.default)(Object.assign({}, security_1.default.slowDown));
// OTP request rate limiter (uses default IP handling)
exports.otpRateLimit = (0, express_rate_limit_1.default)({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 3, // Allow only 3 OTP requests per 5 minutes
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            message: 'Too many OTP requests. Please wait before requesting another.',
            error: {
                type: 'OTP_RATE_LIMIT_EXCEEDED',
                retryAfter: 300, // 5 minutes in seconds
            }
        });
    },
    standardHeaders: true,
    legacyHeaders: false,
});
// File upload rate limiter (uses default IP handling)
exports.fileUploadRateLimit = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 50, // 50 file uploads per hour
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            message: 'File upload limit exceeded. Please try again later.',
            error: {
                type: 'FILE_UPLOAD_RATE_LIMIT_EXCEEDED',
                retryAfter: 3600,
            }
        });
    },
    skip: (req) => {
        // Skip for small files or specific endpoints
        const contentLength = req.headers['content-length'];
        return !!(contentLength && parseInt(contentLength) < 1024 * 1024); // Skip for files < 1MB
    }
});
// Admin endpoints rate limiter (uses default IP handling)
exports.adminRateLimit = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 2000, // Higher limit for admin operations
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            message: 'Admin rate limit exceeded. Please try again later.',
            error: {
                type: 'ADMIN_RATE_LIMIT_EXCEEDED',
                retryAfter: Math.ceil(15 * 60), // 15 minutes
            }
        });
    }
});
// For authenticated endpoints that need user-specific rate limiting
// Only use custom keyGenerator for authenticated users (not IP-based)
exports.authenticatedRateLimit = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // 500 requests per 15 minutes for authenticated users
    keyGenerator: (req) => {
        var _a;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        // Only use user ID for authenticated users
        return userId ? `user:${userId}` : 'anonymous';
    },
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            message: 'Too many requests from this user. Please try again later.',
            error: {
                type: 'AUTHENTICATED_RATE_LIMIT_EXCEEDED',
                retryAfter: 900, // 15 minutes
            }
        });
    },
    standardHeaders: true,
    legacyHeaders: false,
});
// Cleanup function for graceful shutdown
const cleanup = () => {
    // Rate limiter cleanup completed
};
exports.cleanup = cleanup;
// Export all rate limiters
exports.default = {
    general: exports.generalRateLimit,
    auth: exports.authRateLimit,
    login: exports.loginRateLimit,
    passwordReset: exports.passwordResetRateLimit,
    speed: exports.speedLimiter,
    otp: exports.otpRateLimit,
    fileUpload: exports.fileUploadRateLimit,
    admin: exports.adminRateLimit,
    authenticated: exports.authenticatedRateLimit,
    cleanup: exports.cleanup
};
