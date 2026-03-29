"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const client_1 = require("@prisma/client");
const Comment_controller_1 = require("./Comment.controller");
const router = express_1.default.Router({ mergeParams: true });
// POST /api/v1/reports/:id/comments
router.post('/', (0, auth_1.default)(client_1.Role.EMPLOYEE, client_1.Role.ADMIN, client_1.Role.SUPERADMIN), Comment_controller_1.CommentControllers.createComment);
// GET /api/v1/reports/:id/comments
router.get('/', (0, auth_1.default)(client_1.Role.EMPLOYEE, client_1.Role.ADMIN, client_1.Role.SUPERADMIN), Comment_controller_1.CommentControllers.getCommentsByReportId);
exports.CommentRoutes = router;
