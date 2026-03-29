"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanup = exports.logout = exports.isTokenBlacklisted = exports.blacklistToken = exports.enhancedCheckOTP = void 0;
const config_1 = __importDefault(require("../../config"));
const http_status_1 = __importDefault(require("http-status"));
const jwtHelpers_1 = require("../helpers/jwtHelpers");
const prisma_1 = __importDefault(require("../lib/prisma"));
const client_1 = require("@prisma/client");
const ApiError_1 = __importDefault(require("../errors/ApiError"));
// In-memory token blacklist with automatic cleanup
const tokenBlacklist = new Map(); // token -> expiry timestamp
// Clean up expired tokens every 30 minutes
setInterval(() => {
    const now = Date.now();
    for (const [token, expiry] of tokenBlacklist.entries()) {
        if (expiry < now) {
            tokenBlacklist.delete(token);
        }
    }
}, 30 * 60 * 1000);
// Enhanced authentication middleware
const enhancedAuth = (...roles) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const startTime = Date.now();
            const headersAuth = req.headers.authorization;
            const userAgent = req.headers['user-agent'] || 'unknown';
            const clientIP = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
            // Check for proper authorization header format
            if (!headersAuth || !headersAuth.startsWith('Bearer ')) {
                logSecurityEvent('INVALID_AUTH_FORMAT', { ip: clientIP, userAgent, path: req.path });
                throw new ApiError_1.default(http_status_1.default.UNAUTHORIZED, 'Invalid authorization format!');
            }
            const token = headersAuth === null || headersAuth === void 0 ? void 0 : headersAuth.split(' ')[1];
            if (!token) {
                logSecurityEvent('MISSING_TOKEN', { ip: clientIP, userAgent, path: req.path });
                throw new ApiError_1.default(http_status_1.default.UNAUTHORIZED, 'You are not authorized!');
            }
            // Check if token is blacklisted
            if ((0, exports.isTokenBlacklisted)(token)) {
                logSecurityEvent('BLACKLISTED_TOKEN_USED', { ip: clientIP, userAgent, path: req.path, token: token.substring(0, 10) + '...' });
                throw new ApiError_1.default(http_status_1.default.UNAUTHORIZED, 'Token has been revoked!');
            }
            // Verify JWT token with enhanced security
            const verifiedUser = jwtHelpers_1.jwtHelpers.verifyToken(token, config_1.default.jwt.access_secret);
            if (!(verifiedUser === null || verifiedUser === void 0 ? void 0 : verifiedUser.email) || !(verifiedUser === null || verifiedUser === void 0 ? void 0 : verifiedUser.id)) {
                logSecurityEvent('INVALID_TOKEN', { ip: clientIP, userAgent, path: req.path, token: token.substring(0, 10) + '...' });
                throw new ApiError_1.default(http_status_1.default.UNAUTHORIZED, 'Invalid token payload!');
            }
            // Check token freshness (prevent use of old tokens)
            const tokenAge = Date.now() / 1000 - (verifiedUser.iat || 0);
            const maxTokenAge = 24 * 60 * 60; // 24 hours
            if (tokenAge > maxTokenAge) {
                logSecurityEvent('EXPIRED_TOKEN_USED', {
                    ip: clientIP,
                    userAgent,
                    path: req.path,
                    tokenAge: Math.round(tokenAge / 3600) + ' hours',
                    userId: verifiedUser.id
                });
                throw new ApiError_1.default(http_status_1.default.UNAUTHORIZED, 'Token is too old, please re-authenticate!');
            }
            const { id, email } = verifiedUser;
            // Fetch user with security checks
            const user = yield prisma_1.default.user.findUnique({
                where: { id },
                select: {
                    id: true,
                    email: true,
                    role: true,
                    status: true,
                    isDeleted: true,
                    updatedAt: true,
                }
            });
            if (!user) {
                logSecurityEvent('TOKEN_FOR_NONEXISTENT_USER', {
                    ip: clientIP,
                    userAgent,
                    path: req.path,
                    userId: id,
                    email
                });
                throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'User not found!');
            }
            // Check if user is deleted
            if (user.isDeleted) {
                logSecurityEvent('DELETED_USER_ACCESS_ATTEMPT', {
                    ip: clientIP,
                    userAgent,
                    path: req.path,
                    userId: id,
                    email
                });
                throw new ApiError_1.default(http_status_1.default.FORBIDDEN, 'Account has been deleted!');
            }
            // Check user status
            if (user.status === client_1.UserStatus.BLOCKED) {
                logSecurityEvent('BLOCKED_USER_ACCESS_ATTEMPT', {
                    ip: clientIP,
                    userAgent,
                    path: req.path,
                    userId: id,
                    email
                });
                throw new ApiError_1.default(http_status_1.default.FORBIDDEN, 'Your account is blocked!');
            }
            if (user.status === client_1.UserStatus.INACTIVE) {
                throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Your account is not activated yet!');
            }
            if (user.status === client_1.UserStatus.PENDING) {
                throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Your account is not accepted yet!');
            }
            // Role-based access control
            if (roles.length && !roles.includes(verifiedUser.role)) {
                logSecurityEvent('INSUFFICIENT_PERMISSIONS', {
                    ip: clientIP,
                    userAgent,
                    path: req.path,
                    userId: id,
                    email,
                    userRole: verifiedUser.role,
                    requiredRoles: roles
                });
                throw new ApiError_1.default(http_status_1.default.FORBIDDEN, 'Insufficient permissions!');
            }
            // Add user info to request
            req.user = Object.assign(Object.assign({}, verifiedUser), { ip: clientIP, userAgent, loginTime: startTime });
            next();
        }
        catch (err) {
            next(err);
        }
    });
};
// Enhanced OTP check middleware
const enhancedCheckOTP = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const headersAuth = req.headers.authorization;
        const clientIP = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
        const userAgent = req.headers['user-agent'] || 'unknown';
        if (!headersAuth || !headersAuth.startsWith('Bearer ')) {
            logSecurityEvent('OTP_INVALID_AUTH_FORMAT', { ip: clientIP, userAgent, path: req.path });
            throw new ApiError_1.default(http_status_1.default.UNAUTHORIZED, 'Invalid authorization format!');
        }
        const token = headersAuth === null || headersAuth === void 0 ? void 0 : headersAuth.split(' ')[1];
        if (!token) {
            throw new ApiError_1.default(http_status_1.default.UNAUTHORIZED, 'You are not authorized!');
        }
        // Check if token is blacklisted
        if ((0, exports.isTokenBlacklisted)(token)) {
            logSecurityEvent('OTP_BLACKLISTED_TOKEN_USED', { ip: clientIP, userAgent, path: req.path });
            throw new ApiError_1.default(http_status_1.default.UNAUTHORIZED, 'Token has been revoked!');
        }
        const verifiedUser = jwtHelpers_1.jwtHelpers.verifyToken(token, config_1.default.jwt.reset_pass_secret);
        if (!(verifiedUser === null || verifiedUser === void 0 ? void 0 : verifiedUser.id)) {
            logSecurityEvent('OTP_INVALID_TOKEN', { ip: clientIP, userAgent, path: req.path });
            throw new ApiError_1.default(http_status_1.default.UNAUTHORIZED, 'Invalid reset token!');
        }
        const { id } = verifiedUser;
        const user = yield prisma_1.default.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                isDeleted: true,
                status: true,
            }
        });
        if (!user) {
            logSecurityEvent('OTP_USER_NOT_FOUND', { ip: clientIP, userAgent, path: req.path, userId: id });
            throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'User not found!');
        }
        if (user.isDeleted) {
            logSecurityEvent('OTP_DELETED_USER', { ip: clientIP, userAgent, path: req.path, userId: id, email: user.email });
            throw new ApiError_1.default(http_status_1.default.FORBIDDEN, 'Account has been deleted!');
        }
        req.user = Object.assign(Object.assign({}, verifiedUser), { ip: clientIP, userAgent });
        next();
    }
    catch (err) {
        next(err);
    }
});
exports.enhancedCheckOTP = enhancedCheckOTP;
// Token blacklisting functions (in-memory)
const blacklistToken = (token) => {
    try {
        // Decode token to get expiry time
        const decoded = jwtHelpers_1.jwtHelpers.verifyToken(token, config_1.default.jwt.access_secret);
        const expiryTime = decoded.exp ? decoded.exp * 1000 : Date.now() + (24 * 60 * 60 * 1000);
        tokenBlacklist.set(token, expiryTime);
    }
    catch (error) {
        // If token is invalid, still blacklist it for a default time
        tokenBlacklist.set(token, Date.now() + (24 * 60 * 60 * 1000));
    }
};
exports.blacklistToken = blacklistToken;
const isTokenBlacklisted = (token) => {
    const expiry = tokenBlacklist.get(token);
    if (!expiry)
        return false;
    if (expiry < Date.now()) {
        tokenBlacklist.delete(token);
        return false;
    }
    return true;
};
exports.isTokenBlacklisted = isTokenBlacklisted;
// Logout middleware that blacklists the token
const logout = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
        if (token) {
            (0, exports.blacklistToken)(token);
            logSecurityEvent('USER_LOGOUT', {
                userId: (_b = req.user) === null || _b === void 0 ? void 0 : _b.id,
                email: (_c = req.user) === null || _c === void 0 ? void 0 : _c.email,
                ip: req.ip,
                userAgent: req.headers['user-agent']
            });
        }
        res.json({
            success: true,
            message: 'Logged out successfully'
        });
    }
    catch (err) {
        next(err);
    }
});
exports.logout = logout;
// Security event logging
const logSecurityEvent = (eventType, details) => {
    const logEntry = {
        timestamp: new Date().toISOString(),
        eventType,
        details,
        severity: getSeverityLevel(eventType)
    };
    // In production, you might want to send this to a security monitoring service
    // or store in a dedicated security logs table
};
const getSeverityLevel = (eventType) => {
    const criticalEvents = ['DELETED_USER_ACCESS_ATTEMPT', 'BLOCKED_USER_ACCESS_ATTEMPT', 'TOKEN_FOR_NONEXISTENT_USER'];
    const highEvents = ['BLACKLISTED_TOKEN_USED', 'EXPIRED_TOKEN_USED', 'TOKEN_BEFORE_PASSWORD_CHANGE'];
    const mediumEvents = ['INVALID_TOKEN', 'INSUFFICIENT_PERMISSIONS', 'LOCKED_ACCOUNT_ACCESS_ATTEMPT'];
    if (criticalEvents.includes(eventType))
        return 'critical';
    if (highEvents.includes(eventType))
        return 'high';
    if (mediumEvents.includes(eventType))
        return 'medium';
    return 'low';
};
// Cleanup function
const cleanup = () => {
    tokenBlacklist.clear();
};
exports.cleanup = cleanup;
exports.default = enhancedAuth;
