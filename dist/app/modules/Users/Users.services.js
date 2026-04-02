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
exports.UsersService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const prisma_1 = __importDefault(require("../../lib/prisma"));
const client_1 = require("@prisma/client");
const paginationHelper_1 = require("../../helpers/paginationHelper");
const ApiError_1 = __importDefault(require("../../errors/ApiError"));
const bcrypt = __importStar(require("bcrypt"));
const config_1 = __importDefault(require("../../../config"));
const getAllUsersFromDB = (filters, options) => __awaiter(void 0, void 0, void 0, function* () {
    const { page, limit, skip } = paginationHelper_1.paginationHelper.calculatePagination(options);
    const { search, role, status } = filters;
    const andConditions = [];
    if (search) {
        andConditions.push({
            OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { employeeId: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
            ],
        });
    }
    if (role && role !== 'all') {
        andConditions.push({ role: role });
    }
    if (status && status !== 'all') {
        andConditions.push({ status: status });
    }
    const whereConditions = andConditions.length > 0 ? { AND: andConditions } : {};
    const result = yield prisma_1.default.user.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy: options.sortBy && options.sortOrder
            ? { [options.sortBy]: options.sortOrder }
            : { createdAt: 'desc' },
        select: Object.assign(Object.assign({ id: true, employeeId: true, name: true, email: true, phone: true, role: true, status: true, isActive: true }, (client_1.Prisma.UserScalarFieldEnum.designation ? { designation: true } : {})), { createdAt: true, updatedAt: true }),
    });
    const total = yield prisma_1.default.user.count({
        where: whereConditions,
    });
    return {
        meta: {
            total,
            page,
            limit,
            totalPage: Math.ceil(total / limit),
            hasNextPage: page < Math.ceil(total / limit),
            hasPreviousPage: page > 1,
        },
        data: result,
    };
});
const getSingleUserFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma_1.default.user.findUnique({
        where: { id },
        select: Object.assign(Object.assign({ id: true, employeeId: true, name: true, email: true, phone: true, role: true, status: true, isActive: true }, (client_1.Prisma.UserScalarFieldEnum.designation ? { designation: true } : {})), { createdAt: true, updatedAt: true }),
    });
    if (!user) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'User not found');
    }
    return user;
});
const updateUserInfoIntoDB = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const existingUser = yield prisma_1.default.user.findUnique({
        where: { id },
    });
    if (!existingUser) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'User not found');
    }
    const result = yield prisma_1.default.user.update({
        where: { id },
        data: payload,
        select: Object.assign({ id: true, employeeId: true, name: true, email: true, phone: true, role: true, status: true, isActive: true }, (client_1.Prisma.UserScalarFieldEnum.designation ? { designation: true } : {})),
    });
    return result;
});
const deleteUserFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const existingUser = yield prisma_1.default.user.findUnique({
        where: { id },
    });
    if (!existingUser) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'User not found');
    }
    const result = yield prisma_1.default.user.delete({
        where: { id },
    });
    return result;
});
const getMyProfileFromDB = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma_1.default.user.findUnique({
        where: { id: userId },
        select: Object.assign(Object.assign({ id: true, employeeId: true, name: true, email: true, phone: true, role: true, status: true, isActive: true }, (client_1.Prisma.UserScalarFieldEnum.designation ? { designation: true } : {})), { createdAt: true }),
    });
    if (!user) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'User not found');
    }
    return user;
});
const createUserInDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const isUserExist = yield prisma_1.default.user.findUnique({
        where: {
            employeeId: payload.employeeId,
        },
    });
    if (isUserExist) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'User already exists with this employee ID');
    }
    // Set default password as employeeId if not provided
    const password = payload.password || payload.employeeId;
    const hashedPassword = yield bcrypt.hash(password, Number(config_1.default.bcrypt_salt_rounds));
    const result = yield prisma_1.default.user.create({
        data: Object.assign(Object.assign({}, payload), { password: hashedPassword }),
        select: Object.assign(Object.assign({ id: true, employeeId: true, name: true, email: true, phone: true, role: true, status: true, isActive: true }, (client_1.Prisma.UserScalarFieldEnum.designation ? { designation: true } : {})), { createdAt: true }),
    });
    return Object.assign(Object.assign({}, result), { password: payload.password });
});
// Public search — returns minimal info for all authenticated users
const searchUsersFromDB = (search) => __awaiter(void 0, void 0, void 0, function* () {
    const whereCondition = search
        ? {
            OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { employeeId: { contains: search, mode: 'insensitive' } },
            ],
            isActive: true,
        }
        : { isActive: true };
    const result = yield prisma_1.default.user.findMany({
        where: whereCondition,
        take: 100,
        orderBy: { name: 'asc' },
        select: Object.assign({ id: true, employeeId: true, name: true, role: true }, (client_1.Prisma.UserScalarFieldEnum.designation ? { designation: true } : {})),
    });
    return result;
});
exports.UsersService = {
    getAllUsersFromDB,
    getSingleUserFromDB,
    updateUserInfoIntoDB,
    deleteUserFromDB,
    getMyProfileFromDB,
    createUserInDB,
    searchUsersFromDB,
};
