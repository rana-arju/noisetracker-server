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
exports.LeaderboardControllers = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../helpers/catchAsync"));
const sendResponse_1 = __importDefault(require("../../helpers/sendResponse"));
const Leaderboard_services_1 = require("./Leaderboard.services");
const getLeaderboard = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { range, month } = req.query;
    const result = yield Leaderboard_services_1.LeaderboardServices.getLeaderboard({ range, month });
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Leaderboard fetched successfully',
        data: result,
    });
}));
const getEmployeeProfile = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { employeeId } = req.params;
    const result = yield Leaderboard_services_1.LeaderboardServices.getEmployeePublicProfile(employeeId);
    (0, sendResponse_1.default)(res, {
        statusCode: result ? http_status_1.default.OK : http_status_1.default.NOT_FOUND,
        success: !!result,
        message: result ? 'Profile fetched successfully' : 'Employee not found',
        data: result,
    });
}));
exports.LeaderboardControllers = { getLeaderboard, getEmployeeProfile };
