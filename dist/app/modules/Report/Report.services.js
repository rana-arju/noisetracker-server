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
exports.ReportServices = void 0;
const client_1 = require("@prisma/client");
const http_status_1 = __importDefault(require("http-status"));
const ApiError_1 = __importDefault(require("../../errors/ApiError"));
const prisma_1 = __importDefault(require("../../lib/prisma"));
const paginationHelper_1 = require("../../helpers/paginationHelper");
const crypto_1 = __importDefault(require("crypto"));
const getAnonymousName = (userId, createdAt) => {
    const adjs = ['Silent', 'Brave', 'Swift', 'Calm', 'Bright', 'Wise', 'Bold', 'Mystic', 'Hidden', 'Steady'];
    const nouns = ['Observer', 'Member', 'Patrol', 'Guardian', 'Tracker', 'Sentinel', 'Whistle', 'Spirit', 'Echo', 'Watch'];
    // Use a hash of userId + year-month to keep it stable but rotating or just userId for full stability
    const hash = crypto_1.default.createHash('md5').update(userId || 'anonymous').digest('hex');
    const adjIndex = parseInt(hash.substring(0, 2), 16) % adjs.length;
    const nounIndex = parseInt(hash.substring(2, 4), 16) % nouns.length;
    const num = parseInt(hash.substring(4, 7), 16) % 100;
    return `${adjs[adjIndex]} ${nouns[nounIndex]} ${num.toString().padStart(2, '0')}`;
};
const createReportIntoDB = (userId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.report.create({
        data: Object.assign(Object.assign({}, payload), { severity: payload.severity ? payload.severity.toUpperCase() : client_1.Severity.MEDIUM, createdById: userId, status: client_1.ReportStatus.PENDING }),
        include: {
            createdBy: true,
        },
    });
    return result;
});
const getAllReportsFromDB = (filters, options, currentUser) => __awaiter(void 0, void 0, void 0, function* () {
    const { page, limit, skip } = paginationHelper_1.paginationHelper.calculatePagination(options);
    const { search, status, severity } = filters;
    const andConditions = [];
    if (search) {
        andConditions.push({
            OR: [
                { reportedEmployeeName: { contains: search, mode: 'insensitive' } },
                { reportedEmployeeId: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ],
        });
    }
    // If not admin, only show approved reports
    const isAdmin = currentUser && (currentUser.role === 'ADMIN' || currentUser.role === 'SUPERADMIN' || currentUser.role === 'ADMIN' || currentUser.role === 'SUPERADMIN');
    if (!isAdmin) {
        andConditions.push({ status: client_1.ReportStatus.APPROVED });
    }
    else if (status && status !== 'all') {
        andConditions.push({ status: status.toUpperCase() });
    }
    if (severity && severity !== 'all') {
        andConditions.push({ severity: severity.toUpperCase() });
    }
    const whereConditions = andConditions.length > 0 ? { AND: andConditions } : {};
    const result = yield prisma_1.default.report.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy: options.sortBy && options.sortOrder
            ? { [options.sortBy]: options.sortOrder }
            : { createdAt: 'desc' },
        include: {
            createdBy: true,
            _count: {
                select: {
                    comments: true,
                    votes: true,
                },
            },
            votes: currentUser ? {
                where: { userId: currentUser.id },
            } : false,
        },
    });
    const total = yield prisma_1.default.report.count({
        where: whereConditions,
    });
    // Calculate votes and anonymize
    const reports = yield Promise.all(result.map((report) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        const upvotes = yield prisma_1.default.reportVote.count({
            where: { reportId: report.id, voteType: client_1.VoteType.UPVOTE },
        });
        const downvotes = yield prisma_1.default.reportVote.count({
            where: { reportId: report.id, voteType: client_1.VoteType.DOWNVOTE },
        });
        const reportData = Object.assign(Object.assign({}, report), { totalUpvotes: upvotes, totalDownvotes: downvotes, totalComments: report._count.comments, currentUserVote: ((_b = (_a = report.votes) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.voteType) || null, anonymousReporterName: getAnonymousName(report.createdById, report.createdAt) });
        // Remove sensitive data if not admin
        if (!isAdmin) {
            delete reportData.createdBy;
            delete reportData.createdById;
        }
        delete reportData.votes;
        delete reportData._count;
        return reportData;
    })));
    return {
        meta: {
            total,
            page,
            limit,
            totalPage: Math.ceil(total / limit),
            hasNextPage: page < Math.ceil(total / limit),
            hasPreviousPage: page > 1,
        },
        data: reports,
    };
});
const getSingleReportFromDB = (id, currentUser) => __awaiter(void 0, void 0, void 0, function* () {
    const report = yield prisma_1.default.report.findUnique({
        where: { id },
        include: {
            createdBy: true,
        },
    });
    if (!report) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Report not found');
    }
    const isAdmin = currentUser && (currentUser.role === 'ADMIN' || currentUser.role === 'SUPERADMIN' || currentUser.role === 'ADMIN' || currentUser.role === 'SUPERADMIN');
    const upvotes = yield prisma_1.default.reportVote.count({
        where: { reportId: id, voteType: client_1.VoteType.UPVOTE },
    });
    const downvotes = yield prisma_1.default.reportVote.count({
        where: { reportId: id, voteType: client_1.VoteType.DOWNVOTE },
    });
    let currentUserVote = null;
    if (currentUser) {
        const vote = yield prisma_1.default.reportVote.findUnique({
            where: {
                reportId_userId: {
                    reportId: id,
                    userId: currentUser.id,
                },
            },
        });
        currentUserVote = (vote === null || vote === void 0 ? void 0 : vote.voteType) || null;
    }
    const reportData = Object.assign(Object.assign({}, report), { totalUpvotes: upvotes, totalDownvotes: downvotes, currentUserVote, anonymousReporterName: getAnonymousName(report.createdById, report.createdAt) });
    if (!isAdmin) {
        delete reportData.createdBy;
        delete reportData.createdById;
    }
    return reportData;
});
const approveReportIntoDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.report.update({
        where: { id },
        data: { status: client_1.ReportStatus.APPROVED },
    });
    return result;
});
const updateReportIntoDB = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const data = Object.assign({}, payload);
    if (data.severity)
        data.severity = data.severity.toUpperCase();
    if (data.status)
        data.status = data.status.toUpperCase();
    const result = yield prisma_1.default.report.update({
        where: { id },
        data,
    });
    return result;
});
const deleteReportFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.report.delete({
        where: { id },
    });
    return result;
});
exports.ReportServices = {
    createReportIntoDB,
    getAllReportsFromDB,
    getSingleReportFromDB,
    approveReportIntoDB,
    updateReportIntoDB,
    deleteReportFromDB,
};
