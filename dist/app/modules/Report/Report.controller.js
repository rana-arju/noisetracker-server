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
exports.ReportControllers = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../helpers/catchAsync"));
const sendResponse_1 = __importDefault(require("../../helpers/sendResponse"));
const pickValidFields_1 = __importDefault(require("../../shared/pickValidFields"));
const Report_services_1 = require("./Report.services");
const createReport = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const result = yield Report_services_1.ReportServices.createReportIntoDB(user.id, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: 'Report created successfully. It will be visible after approval.',
        data: result,
    });
}));
const getAllReports = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const filters = (0, pickValidFields_1.default)(req.query, ['search', 'status', 'severity']);
    const options = (0, pickValidFields_1.default)(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
    const user = req.user;
    const result = yield Report_services_1.ReportServices.getAllReportsFromDB(filters, options, user);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Reports fetched successfully',
        meta: result.meta,
        data: result.data,
    });
}));
const getSingleReport = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const user = req.user;
    const result = yield Report_services_1.ReportServices.getSingleReportFromDB(id, user);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Report fetched successfully',
        data: result,
    });
}));
const approveReport = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield Report_services_1.ReportServices.approveReportIntoDB(id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Report approved successfully',
        data: result,
    });
}));
const updateReport = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield Report_services_1.ReportServices.updateReportIntoDB(id, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Report updated successfully',
        data: result,
    });
}));
const deleteReport = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield Report_services_1.ReportServices.deleteReportFromDB(id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Report deleted successfully',
        data: result,
    });
}));
exports.ReportControllers = {
    createReport,
    getAllReports,
    getSingleReport,
    approveReport,
    updateReport,
    deleteReport,
};
