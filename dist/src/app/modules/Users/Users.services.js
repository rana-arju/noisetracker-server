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
exports.UsersService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const prisma_1 = __importDefault(require("../../lib/prisma"));
const paginationHelper_1 = require("../../helpers/paginationHelper");
const ApiError_1 = __importDefault(require("../../errors/ApiError"));
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
        select: {
            id: true,
            employeeId: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            status: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
        },
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
        select: {
            id: true,
            employeeId: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            status: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
        },
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
        select: {
            id: true,
            employeeId: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            status: true,
            isActive: true,
        },
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
        select: {
            id: true,
            employeeId: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            status: true,
            isActive: true,
            createdAt: true,
        },
    });
    if (!user) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'User not found');
    }
    return user;
});
exports.UsersService = {
    getAllUsersFromDB,
    getSingleUserFromDB,
    updateUserInfoIntoDB,
    deleteUserFromDB,
    getMyProfileFromDB,
};
