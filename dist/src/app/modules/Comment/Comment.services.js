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
exports.CommentServices = void 0;
const http_status_1 = __importDefault(require("http-status"));
const ApiError_1 = __importDefault(require("../../errors/ApiError"));
const prisma_1 = __importDefault(require("../../lib/prisma"));
const paginationHelper_1 = require("../../helpers/paginationHelper");
const crypto_1 = __importDefault(require("crypto"));
const getAnonymousName = (userId) => {
    const adjs = ['Swift', 'Quiet', 'Smart', 'Bright', 'Brave', 'Calm', 'Brisk', 'Cool', 'Daily', 'Early'];
    const nouns = ['Contributor', 'Peer', 'Mate', 'Associate', 'Colleague', 'Ally', 'Partner', 'Friend', 'Voice', 'Mind'];
    const hash = crypto_1.default.createHash('md5').update(userId).digest('hex');
    const adjIndex = parseInt(hash.substring(0, 2), 16) % adjs.length;
    const nounIndex = parseInt(hash.substring(2, 4), 16) % nouns.length;
    const num = parseInt(hash.substring(4, 7), 16) % 100;
    return `${adjs[adjIndex]} ${nouns[nounIndex]} ${num.toString().padStart(2, '0')}`;
};
const createCommentIntoDB = (userId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const report = yield prisma_1.default.report.findUnique({
        where: { id: payload.reportId },
    });
    if (!report) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Report not found');
    }
    const result = yield prisma_1.default.comment.create({
        data: Object.assign(Object.assign({}, payload), { userId }),
        include: {
            user: true,
        },
    });
    return result;
});
const getCommentsByReportIdFromDB = (reportId, options, currentUser) => __awaiter(void 0, void 0, void 0, function* () {
    const { page, limit, skip } = paginationHelper_1.paginationHelper.calculatePagination(options);
    const isAdmin = currentUser && (currentUser.role === 'ADMIN' || currentUser.role === 'SUPERADMIN' || currentUser.role === 'ADMIN' || currentUser.role === 'SUPERADMIN');
    const result = yield prisma_1.default.comment.findMany({
        where: { reportId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
            user: true,
        },
    });
    const total = yield prisma_1.default.comment.count({
        where: { reportId },
    });
    const comments = result.map((comment) => {
        const commentData = Object.assign(Object.assign({}, comment), { anonymousCommenterName: getAnonymousName(comment.userId) });
        if (!isAdmin) {
            delete commentData.user;
            delete commentData.userId;
        }
        return commentData;
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
        data: comments,
    };
});
exports.CommentServices = {
    createCommentIntoDB,
    getCommentsByReportIdFromDB,
};
