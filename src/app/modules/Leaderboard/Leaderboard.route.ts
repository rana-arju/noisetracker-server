import express from 'express';
import { LeaderboardControllers } from './Leaderboard.controller';

const router = express.Router();

// GET /api/v1/leaderboard?range=current-month
// GET /api/v1/leaderboard?month=2026-03
router.get('/', LeaderboardControllers.getLeaderboard);

// GET /api/v1/employees/:employeeId/profile
router.get('/employees/:employeeId/profile', LeaderboardControllers.getEmployeeProfile);

export const LeaderboardRoutes = router;
