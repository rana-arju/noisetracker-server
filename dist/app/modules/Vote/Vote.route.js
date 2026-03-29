"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoteRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const client_1 = require("@prisma/client");
const Vote_controller_1 = require("./Vote.controller");
const router = express_1.default.Router({ mergeParams: true });
// POST /api/v1/reports/:id/vote
router.post('/', (0, auth_1.default)(client_1.Role.EMPLOYEE, client_1.Role.ADMIN, client_1.Role.SUPERADMIN), Vote_controller_1.VoteControllers.castVote);
// DELETE /api/v1/reports/:id/vote
router.delete('/', (0, auth_1.default)(client_1.Role.EMPLOYEE, client_1.Role.ADMIN, client_1.Role.SUPERADMIN), Vote_controller_1.VoteControllers.removeVote);
exports.VoteRoutes = router;
