"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const client_1 = require("@prisma/client");
const Report_controller_1 = require("./Report.controller");
const router = express_1.default.Router();
router.post('/', (0, auth_1.default)(client_1.Role.EMPLOYEE, client_1.Role.ADMIN, client_1.Role.SUPERADMIN), Report_controller_1.ReportControllers.createReport);
router.get('/', (0, auth_1.default)(client_1.Role.EMPLOYEE, client_1.Role.ADMIN, client_1.Role.SUPERADMIN), Report_controller_1.ReportControllers.getAllReports);
router.get('/:id', (0, auth_1.default)(client_1.Role.EMPLOYEE, client_1.Role.ADMIN, client_1.Role.SUPERADMIN), Report_controller_1.ReportControllers.getSingleReport);
// Admin routes
router.patch('/admin/:id/approve', (0, auth_1.default)(client_1.Role.ADMIN, client_1.Role.SUPERADMIN), Report_controller_1.ReportControllers.approveReport);
router.patch('/admin/:id', (0, auth_1.default)(client_1.Role.ADMIN, client_1.Role.SUPERADMIN), Report_controller_1.ReportControllers.updateReport);
router.delete('/admin/:id', (0, auth_1.default)(client_1.Role.ADMIN, client_1.Role.SUPERADMIN), Report_controller_1.ReportControllers.deleteReport);
exports.ReportRoutes = router;
