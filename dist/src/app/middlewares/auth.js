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
exports.optionalAuth = exports.checkOTP = void 0;
const config_1 = __importDefault(require("../../config"));
const http_status_1 = __importDefault(require("http-status"));
const jwtHelpers_1 = require("../helpers/jwtHelpers");
const prisma_1 = __importDefault(require("../lib/prisma"));
const client_1 = require("@prisma/client");
const ApiError_1 = __importDefault(require("../errors/ApiError"));
const auth = (...roles) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const headersAuth = req.headers.authorization;
            if (!headersAuth || !headersAuth.startsWith("Bearer ")) {
                throw new ApiError_1.default(http_status_1.default.UNAUTHORIZED, "Invalid authorization format!");
            }
            const token = headersAuth === null || headersAuth === void 0 ? void 0 : headersAuth.split(' ')[1];
            if (!token) {
                throw new ApiError_1.default(http_status_1.default.UNAUTHORIZED, "You are not authorized!");
            }
            const verifiedUser = jwtHelpers_1.jwtHelpers.verifyToken(token, config_1.default.jwt.access_secret);
            if (!(verifiedUser === null || verifiedUser === void 0 ? void 0 : verifiedUser.id)) {
                throw new ApiError_1.default(http_status_1.default.UNAUTHORIZED, "You are not authorized!");
            }
            const user = yield prisma_1.default.user.findUnique({
                where: { id: verifiedUser.id },
            });
            if (!user) {
                throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "User not found!");
            }
            if (user.status === client_1.UserStatus.BLOCKED) {
                throw new ApiError_1.default(http_status_1.default.FORBIDDEN, 'Your account is blocked!');
            }
            if (!user.isActive) {
                throw new ApiError_1.default(http_status_1.default.FORBIDDEN, 'Your account is inactive!');
            }
            // Attach full user details to request
            req.user = {
                id: user.id,
                employeeId: user.employeeId,
                role: user.role,
                name: user.name,
                email: user.email,
            };
            if (roles.length && !roles.includes(user.role)) {
                throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "Forbidden! You are not authorized!");
            }
            next();
        }
        catch (err) {
            next(err);
        }
    });
};
const checkOTP = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const headersAuth = req.headers.authorization;
        if (!headersAuth || !headersAuth.startsWith("Bearer ")) {
            throw new ApiError_1.default(http_status_1.default.UNAUTHORIZED, "Invalid authorization format!");
        }
        const token = headersAuth === null || headersAuth === void 0 ? void 0 : headersAuth.split(' ')[1];
        if (!token) {
            throw new ApiError_1.default(http_status_1.default.UNAUTHORIZED, "You are not authorized!");
        }
        const verifiedUser = jwtHelpers_1.jwtHelpers.verifyToken(token, config_1.default.jwt.reset_pass_secret);
        if (!(verifiedUser === null || verifiedUser === void 0 ? void 0 : verifiedUser.id)) {
            throw new ApiError_1.default(http_status_1.default.UNAUTHORIZED, "You are not authorized!");
        }
        const { id } = verifiedUser;
        const user = yield prisma_1.default.user.findUnique({
            where: {
                id: id,
            },
        });
        if (!user) {
            throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "User not found!");
        }
        req.user = verifiedUser;
        next();
    }
    catch (err) {
        next(err);
    }
});
exports.checkOTP = checkOTP;
const optionalAuth = (...roles) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const headersAuth = req.headers.authorization;
            const token = headersAuth === null || headersAuth === void 0 ? void 0 : headersAuth.split(' ')[1];
            if (!token) {
                // No token provided, proceed without authentication
                return next();
            }
            const verifiedUser = jwtHelpers_1.jwtHelpers.verifyToken(token, config_1.default.jwt.access_secret);
            if (!(verifiedUser === null || verifiedUser === void 0 ? void 0 : verifiedUser.email)) {
                throw new ApiError_1.default(http_status_1.default.UNAUTHORIZED, 'You are not authorized!');
            }
            const { id } = verifiedUser;
            const user = yield prisma_1.default.user.findUnique({
                where: { id },
            });
            if (!user) {
                throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'User not found!');
            }
            if (user.status === client_1.UserStatus.BLOCKED) {
                throw new ApiError_1.default(http_status_1.default.FORBIDDEN, 'Your account is blocked!');
            }
            req.user = verifiedUser;
            if (roles.length && !roles.includes(verifiedUser.role)) {
                throw new ApiError_1.default(http_status_1.default.FORBIDDEN, 'Forbidden!');
            }
            next();
        }
        catch (err) {
            next(err);
        }
    });
};
exports.optionalAuth = optionalAuth;
exports.default = auth;
