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
exports.UsersController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const Users_services_1 = require("./Users.services");
const Users_bulk_service_1 = require("./Users.bulk.service");
const catchAsync_1 = __importDefault(require("../../helpers/catchAsync"));
const ApiError_1 = __importDefault(require("../../errors/ApiError"));
const sendResponse_1 = __importDefault(require("../../helpers/sendResponse"));
const pickValidFields_1 = __importDefault(require("../../shared/pickValidFields"));
const getAllUsers = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const filters = (0, pickValidFields_1.default)(req.query, ['search', 'role', 'status']);
    const options = (0, pickValidFields_1.default)(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
    const result = yield Users_services_1.UsersService.getAllUsersFromDB(filters, options);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Users fetched successfully',
        meta: result.meta,
        data: result.data,
    });
}));
const getSingleUser = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield Users_services_1.UsersService.getSingleUserFromDB(id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'User fetched successfully',
        data: result,
    });
}));
const updateUserInfo = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield Users_services_1.UsersService.updateUserInfoIntoDB(id, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'User updated successfully',
        data: result,
    });
}));
const deleteUser = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield Users_services_1.UsersService.deleteUserFromDB(id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'User deleted successfully',
        data: result,
    });
}));
const getMyProfile = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const result = yield Users_services_1.UsersService.getMyProfileFromDB(user.id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Profile fetched successfully',
        data: result,
    });
}));
const previewBulkUpload = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (!req.file) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Please upload a file');
    }
    const filePath = req.file.path;
    const fileExtension = (_a = req.file.originalname.split('.').pop()) === null || _a === void 0 ? void 0 : _a.toLowerCase();
    const result = yield Users_bulk_service_1.UsersBulkService.getBulkUploadPreview(filePath, fileExtension === 'csv' ? 'csv' : 'excel');
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Bulk upload preview generated',
        data: result,
    });
}));
const confirmBulkUpload = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { users } = req.body;
    if (!users || !Array.isArray(users)) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'User data is required and must be an array');
    }
    const result = yield Users_bulk_service_1.UsersBulkService.confirmBulkUpload(users);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Bulk upload completed',
        data: result,
    });
}));
const createUser = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield Users_services_1.UsersService.createUserInDB(req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'User created successfully',
        data: result,
    });
}));
exports.UsersController = {
    getAllUsers,
    getSingleUser,
    updateUserInfo,
    deleteUser,
    getMyProfile,
    previewBulkUpload,
    confirmBulkUpload,
    createUser,
};
