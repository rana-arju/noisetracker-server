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
exports.VoteControllers = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../helpers/catchAsync"));
const sendResponse_1 = __importDefault(require("../../helpers/sendResponse"));
const Vote_services_1 = require("./Vote.services");
const ApiError_1 = __importDefault(require("../../errors/ApiError"));
const castVote = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const { id: reportId } = req.params;
    const { voteType } = req.body;
    if (!voteType || !['UPVOTE', 'DOWNVOTE'].includes(voteType)) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'voteType must be UPVOTE or DOWNVOTE');
    }
    const result = yield Vote_services_1.VoteServices.castVote(user.id, reportId, voteType);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: result.message,
        data: result,
    });
}));
const removeVote = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const { id: reportId } = req.params;
    const result = yield Vote_services_1.VoteServices.removeVote(user.id, reportId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: result.message,
        data: result,
    });
}));
exports.VoteControllers = { castVote, removeVote };
