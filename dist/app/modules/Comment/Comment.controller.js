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
exports.CommentControllers = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../helpers/catchAsync"));
const sendResponse_1 = __importDefault(require("../../helpers/sendResponse"));
const pickValidFields_1 = __importDefault(require("../../shared/pickValidFields"));
const Comment_services_1 = require("./Comment.services");
const createComment = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const result = yield Comment_services_1.CommentServices.createCommentIntoDB(user.id, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: 'Comment added successfully',
        data: result,
    });
}));
const getCommentsByReportId = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const options = (0, pickValidFields_1.default)(req.query, ['limit', 'page']);
    const user = req.user;
    const result = yield Comment_services_1.CommentServices.getCommentsByReportIdFromDB(id, options, user);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Comments fetched successfully',
        meta: result.meta,
        data: result.data,
    });
}));
exports.CommentControllers = {
    createComment,
    getCommentsByReportId,
};
