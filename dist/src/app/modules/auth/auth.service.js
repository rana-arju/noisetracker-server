"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.AuthServices = void 0;
const bcrypt = __importStar(require("bcrypt"));
const http_status_1 = __importDefault(require("http-status"));
const config_1 = __importDefault(require("../../../config"));
const ApiError_1 = __importDefault(require("../../errors/ApiError"));
const prisma_1 = __importDefault(require("../../lib/prisma"));
const jwtHelpers_1 = require("../../helpers/jwtHelpers");
const client_1 = require("@prisma/client");
const verifyToken_1 = require("../../utils/verifyToken");
const loginUserFromDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma_1.default.user.findUnique({
        where: {
            employeeId: payload.employeeId,
        },
    });
    if (!user) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'User not found');
    }
    if (user.status === client_1.UserStatus.BLOCKED || !user.isActive) {
        throw new ApiError_1.default(http_status_1.default.FORBIDDEN, 'Your account is not active. Please contact admin.');
    }
    const isCorrectPassword = yield bcrypt.compare(payload.password, user.password);
    if (!isCorrectPassword) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Password incorrect');
    }
    const jwtPayload = {
        id: user.id,
        employeeId: user.employeeId,
        role: user.role,
    };
    const accessToken = jwtHelpers_1.jwtHelpers.generateToken(jwtPayload, config_1.default.jwt.access_secret, config_1.default.jwt.access_expires_in);
    const refreshToken = jwtHelpers_1.jwtHelpers.generateToken(jwtPayload, config_1.default.jwt.refresh_secret, config_1.default.jwt.refresh_expires_in);
    return {
        user: {
            id: user.id,
            employeeId: user.employeeId,
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status,
        },
        accessToken,
        refreshToken,
    };
});
const changePassword = (userId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma_1.default.user.findUnique({
        where: { id: userId },
    });
    if (!user) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'User not found');
    }
    const isCorrectPassword = yield bcrypt.compare(payload.oldPassword, user.password);
    if (!isCorrectPassword) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Old password incorrect');
    }
    const hashedPassword = yield bcrypt.hash(payload.newPassword, Number(config_1.default.bcrypt_salt_rounds));
    yield prisma_1.default.user.update({
        where: { id: userId },
        data: {
            password: hashedPassword,
        },
    });
    return {
        message: 'Password updated successfully',
    };
});
const refreshToken = (token) => __awaiter(void 0, void 0, void 0, function* () {
    const decoded = (0, verifyToken_1.verifyToken)(token, config_1.default.jwt.refresh_secret);
    const { employeeId } = decoded;
    const user = yield prisma_1.default.user.findUnique({
        where: { employeeId },
    });
    if (!user) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'User not found');
    }
    if (user.status === client_1.UserStatus.BLOCKED || !user.isActive) {
        throw new ApiError_1.default(http_status_1.default.FORBIDDEN, 'Account is not active');
    }
    const jwtPayload = {
        id: user.id,
        employeeId: user.employeeId,
        role: user.role,
    };
    const accessToken = jwtHelpers_1.jwtHelpers.generateToken(jwtPayload, config_1.default.jwt.access_secret, config_1.default.jwt.access_expires_in);
    const newRefreshToken = jwtHelpers_1.jwtHelpers.generateToken(jwtPayload, config_1.default.jwt.refresh_secret, config_1.default.jwt.refresh_expires_in);
    return {
        accessToken,
        refreshToken: newRefreshToken,
    };
});
exports.AuthServices = {
    loginUserFromDB,
    changePassword,
    refreshToken,
};
