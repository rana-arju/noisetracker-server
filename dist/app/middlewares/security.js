"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateContentType = exports.securityLogger = exports.ipWhitelist = exports.fileUploadSecurity = exports.apiSecurityHeaders = exports.requestSizeLimit = exports.compressionMiddleware = exports.xssProtection = exports.mongoSanitization = exports.parameterPollutionProtection = exports.securityHeaders = void 0;
const helmet_1 = __importDefault(require("helmet"));
const xss_1 = __importDefault(require("xss"));
const hpp_1 = __importDefault(require("hpp"));
const express_mongo_sanitize_1 = __importDefault(require("express-mongo-sanitize"));
const compression_1 = __importDefault(require("compression"));
const security_1 = __importDefault(require("../../config/security"));
const config_1 = __importDefault(require("../../config"));
// Configure Helmet for security headers
const securityHeaders = (req, res, next) => {
    // Skip restrictive headers for static file serving
    if (req.path.startsWith('/uploads/') || req.path.startsWith('/charts/')) {
        // Only apply basic security headers for static files
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('X-XSS-Protection', '1; mode=block');
        return next();
    }
    // Apply full helmet configuration for other routes
    return (0, helmet_1.default)(Object.assign(Object.assign({}, security_1.default.helmet), { 
        // Only enable HTTPS in production
        hsts: config_1.default.env === 'production' ? security_1.default.helmet.hsts : false, 
        // Configure CSP based on environment
        contentSecurityPolicy: config_1.default.env === 'production' ? security_1.default.helmet.contentSecurityPolicy : false }))(req, res, next);
};
exports.securityHeaders = securityHeaders;
// HTTP Parameter Pollution protection
exports.parameterPollutionProtection = (0, hpp_1.default)({
    whitelist: [
        'tags', // Allow multiple tags
        'categories', // Allow multiple categories
        'ids', // Allow multiple IDs
        'types' // Allow multiple types
    ]
});
// MongoDB injection protection
exports.mongoSanitization = (0, express_mongo_sanitize_1.default)({
    onSanitize: ({ req, key }) => {
        // MongoDB injection attempt detected
    },
});
// XSS protection middleware
const xssProtection = (req, res, next) => {
    // Sanitize request body
    if (req.body && typeof req.body === 'object') {
        req.body = sanitizeObject(req.body);
    }
    // Sanitize query parameters
    if (req.query && typeof req.query === 'object') {
        req.query = sanitizeObject(req.query);
    }
    // Sanitize URL parameters
    if (req.params && typeof req.params === 'object') {
        req.params = sanitizeObject(req.params);
    }
    next();
};
exports.xssProtection = xssProtection;
// Helper function to recursively sanitize objects
const sanitizeObject = (obj) => {
    if (obj === null || obj === undefined)
        return obj;
    if (Array.isArray(obj)) {
        return obj.map(sanitizeObject);
    }
    if (typeof obj === 'object') {
        const sanitized = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                sanitized[key] = sanitizeObject(obj[key]);
            }
        }
        return sanitized;
    }
    if (typeof obj === 'string') {
        return (0, xss_1.default)(obj, {
            whiteList: {
                // Allow basic formatting tags if needed
                strong: [],
                b: [],
                em: [],
                i: [],
                u: [],
                br: [],
                p: [],
            },
            stripIgnoreTag: true,
            stripIgnoreTagBody: ['script'],
        });
    }
    return obj;
};
// Content compression middleware
exports.compressionMiddleware = (0, compression_1.default)({
    // Only compress responses larger than 1kb
    threshold: 1024,
    // Compression level (1-9, 6 is default)
    level: 6,
    // Don't compress if client doesn't support it
    filter: (req, res) => {
        if (req.headers['x-no-compression']) {
            return false;
        }
        return compression_1.default.filter(req, res);
    },
});
// Request size limiting middleware
const requestSizeLimit = (req, res, next) => {
    const contentLength = req.headers['content-length'];
    if (contentLength) {
        const size = parseInt(contentLength);
        const maxSize = 20 * 1024 * 1024; // 20MB
        if (size > maxSize) {
            return res.status(413).json({
                success: false,
                message: 'Request entity too large',
                error: {
                    type: 'PAYLOAD_TOO_LARGE',
                    maxSize: `${maxSize / (1024 * 1024)}MB`,
                    receivedSize: `${Math.round(size / (1024 * 1024) * 100) / 100}MB`
                }
            });
        }
    }
    next();
};
exports.requestSizeLimit = requestSizeLimit;
// Security headers for API responses
const apiSecurityHeaders = (req, res, next) => {
    // Remove server information
    res.removeHeader('X-Powered-By');
    // Add custom security headers
    res.setHeader('X-API-Version', '1.0');
    res.setHeader('X-Request-ID', req.headers['x-request-id'] || generateRequestId());
    // Cache control for sensitive endpoints
    if (req.path.includes('/auth/') || req.path.includes('/admin/')) {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
    }
    next();
};
exports.apiSecurityHeaders = apiSecurityHeaders;
// Generate unique request ID
const generateRequestId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
};
// File upload security middleware
const fileUploadSecurity = (req, res, next) => {
    const files = req.files;
    if (files && files.length > 0) {
        const allowedMimeTypes = [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/gif',
            'image/webp',
            'application/pdf',
            'text/plain',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        const maxFileSize = 20 * 1024 * 1024; // 20MB
        for (const file of files) {
            // Check file type
            if (!allowedMimeTypes.includes(file.mimetype)) {
                return res.status(400).json({
                    success: false,
                    message: `File type ${file.mimetype} is not allowed`,
                    error: {
                        type: 'INVALID_FILE_TYPE',
                        allowedTypes: allowedMimeTypes
                    }
                });
            }
            // Check file size
            if (file.size > maxFileSize) {
                return res.status(413).json({
                    success: false,
                    message: 'File too large',
                    error: {
                        type: 'FILE_TOO_LARGE',
                        maxSize: `${maxFileSize / (1024 * 1024)}MB`,
                        receivedSize: `${Math.round(file.size / (1024 * 1024) * 100) / 100}MB`
                    }
                });
            }
            // Basic file name sanitization
            file.originalname = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
        }
    }
    next();
};
exports.fileUploadSecurity = fileUploadSecurity;
// IP whitelist middleware (for admin or sensitive endpoints)
const ipWhitelist = (allowedIPs = []) => {
    return (req, res, next) => {
        if (config_1.default.env === 'development') {
            return next(); // Skip IP whitelist in development
        }
        const clientIP = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
        if (allowedIPs.length > 0 && !allowedIPs.includes(clientIP || '')) {
            return res.status(403).json({
                success: false,
                message: 'Access denied',
                error: {
                    type: 'IP_NOT_WHITELISTED'
                }
            });
        }
        next();
    };
};
exports.ipWhitelist = ipWhitelist;
// Request logging for security events
const securityLogger = (req, res, next) => {
    const startTime = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - startTime;
        const logData = {
            method: req.method,
            url: req.originalUrl,
            ip: req.ip,
            userAgent: req.headers['user-agent'],
            statusCode: res.statusCode,
            duration,
            timestamp: new Date().toISOString()
        };
        // Log suspicious requests
        if (res.statusCode >= 400 || duration > 5000) {
            // Security event logged
        }
    });
    next();
};
exports.securityLogger = securityLogger;
// Content-Type validation middleware
const validateContentType = (allowedTypes = ['application/json']) => {
    return (req, res, next) => {
        if (req.method === 'GET' || req.method === 'DELETE') {
            return next(); // Skip validation for GET and DELETE
        }
        const contentType = req.headers['content-type'];
        if (!contentType) {
            return res.status(400).json({
                success: false,
                message: 'Content-Type header is required',
                error: {
                    type: 'MISSING_CONTENT_TYPE'
                }
            });
        }
        const isValidType = allowedTypes.some(type => contentType.toLowerCase().includes(type.toLowerCase()));
        if (!isValidType) {
            return res.status(415).json({
                success: false,
                message: 'Unsupported Media Type',
                error: {
                    type: 'UNSUPPORTED_MEDIA_TYPE',
                    received: contentType,
                    allowed: allowedTypes
                }
            });
        }
        next();
    };
};
exports.validateContentType = validateContentType;
exports.default = {
    securityHeaders: exports.securityHeaders,
    parameterPollutionProtection: exports.parameterPollutionProtection,
    mongoSanitization: exports.mongoSanitization,
    xssProtection: exports.xssProtection,
    compressionMiddleware: exports.compressionMiddleware,
    requestSizeLimit: exports.requestSizeLimit,
    apiSecurityHeaders: exports.apiSecurityHeaders,
    fileUploadSecurity: exports.fileUploadSecurity,
    ipWhitelist: exports.ipWhitelist,
    securityLogger: exports.securityLogger,
    validateContentType: exports.validateContentType
};
