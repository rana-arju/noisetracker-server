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
exports.VoteServices = void 0;
const http_status_1 = __importDefault(require("http-status"));
const ApiError_1 = __importDefault(require("../../errors/ApiError"));
const prisma_1 = __importDefault(require("../../lib/prisma"));
const castVote = (userId, reportId, voteType) => __awaiter(void 0, void 0, void 0, function* () {
    const report = yield prisma_1.default.report.findUnique({ where: { id: reportId } });
    if (!report)
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Report not found');
    // Check existing vote
    const existingVote = yield prisma_1.default.reportVote.findUnique({
        where: { reportId_userId: { reportId, userId } },
    });
    if (existingVote) {
        if (existingVote.voteType === voteType) {
            // Same vote — remove it (toggle off)
            yield prisma_1.default.reportVote.delete({
                where: { reportId_userId: { reportId, userId } },
            });
            return { currentUserVote: null, message: 'Vote removed' };
        }
        else {
            // Different vote — switch it
            const updated = yield prisma_1.default.reportVote.update({
                where: { reportId_userId: { reportId, userId } },
                data: { voteType },
            });
            return { currentUserVote: updated.voteType, message: 'Vote updated' };
        }
    }
    // New vote
    const created = yield prisma_1.default.reportVote.create({
        data: { reportId, userId, voteType },
    });
    return { currentUserVote: created.voteType, message: 'Vote cast' };
});
const removeVote = (userId, reportId) => __awaiter(void 0, void 0, void 0, function* () {
    const existingVote = yield prisma_1.default.reportVote.findUnique({
        where: { reportId_userId: { reportId, userId } },
    });
    if (!existingVote)
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'No vote found to remove');
    yield prisma_1.default.reportVote.delete({
        where: { reportId_userId: { reportId, userId } },
    });
    return { currentUserVote: null, message: 'Vote removed' };
});
const getVoteSummary = (reportId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const [upvotes, downvotes] = yield Promise.all([
        prisma_1.default.reportVote.count({ where: { reportId, voteType: 'UPVOTE' } }),
        prisma_1.default.reportVote.count({ where: { reportId, voteType: 'DOWNVOTE' } }),
    ]);
    let currentUserVote = null;
    if (userId) {
        const vote = yield prisma_1.default.reportVote.findUnique({
            where: { reportId_userId: { reportId, userId } },
        });
        currentUserVote = (_a = vote === null || vote === void 0 ? void 0 : vote.voteType) !== null && _a !== void 0 ? _a : null;
    }
    return { totalUpvotes: upvotes, totalDownvotes: downvotes, currentUserVote };
});
exports.VoteServices = { castVote, removeVote, getVoteSummary };
