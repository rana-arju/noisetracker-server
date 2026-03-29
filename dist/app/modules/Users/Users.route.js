"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const client_1 = require("@prisma/client");
const Users_controller_1 = require("./Users.controller");
const multerFileUpload_1 = require("../../middlewares/multerFileUpload");
const router = express_1.default.Router();
router.get('/me', (0, auth_1.default)(client_1.Role.EMPLOYEE, client_1.Role.ADMIN, client_1.Role.SUPERADMIN), Users_controller_1.UsersController.getMyProfile);
// Public search — any authenticated user can search for users to report
router.get('/search', (0, auth_1.default)(client_1.Role.EMPLOYEE, client_1.Role.ADMIN, client_1.Role.SUPERADMIN), Users_controller_1.UsersController.searchUsers);
// Admin routes
router.get('/', (0, auth_1.default)(client_1.Role.ADMIN, client_1.Role.SUPERADMIN), Users_controller_1.UsersController.getAllUsers);
router.post('/preview-upload', (0, auth_1.default)(client_1.Role.ADMIN, client_1.Role.SUPERADMIN), multerFileUpload_1.fileUploader.excelUpload, Users_controller_1.UsersController.previewBulkUpload);
router.post('/confirm-upload', (0, auth_1.default)(client_1.Role.ADMIN, client_1.Role.SUPERADMIN), Users_controller_1.UsersController.confirmBulkUpload);
router.post('/', (0, auth_1.default)(client_1.Role.ADMIN, client_1.Role.SUPERADMIN), Users_controller_1.UsersController.createUser);
router.get('/:id', (0, auth_1.default)(client_1.Role.ADMIN, client_1.Role.SUPERADMIN), Users_controller_1.UsersController.getSingleUser);
router.patch('/:id', (0, auth_1.default)(client_1.Role.ADMIN, client_1.Role.SUPERADMIN), Users_controller_1.UsersController.updateUserInfo);
router.delete('/:id', (0, auth_1.default)(client_1.Role.ADMIN, client_1.Role.SUPERADMIN), Users_controller_1.UsersController.deleteUser);
exports.UsersRoutes = router;
