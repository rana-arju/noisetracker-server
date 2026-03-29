"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeaderboardRoutes = void 0;
const express_1 = __importDefault(require("express"));
const Leaderboard_controller_1 = require("./Leaderboard.controller");
const router = express_1.default.Router();
// GET /api/v1/leaderboard?range=current-month
// GET /api/v1/leaderboard?month=2026-03
router.get('/', Leaderboard_controller_1.LeaderboardControllers.getLeaderboard);
// GET /api/v1/employees/:employeeId/profile
router.get('/employees/:employeeId/profile', Leaderboard_controller_1.LeaderboardControllers.getEmployeeProfile);
exports.LeaderboardRoutes = router;
