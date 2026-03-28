import express from 'express';
import { AuthRouters } from '../modules/auth/auth.routes';
import { UsersRoutes } from '../modules/Users/Users.route';
import { ReportRoutes } from '../modules/Report/Report.route';
import { CommentRoutes } from '../modules/Comment/Comment.route';
import { VoteRoutes } from '../modules/Vote/Vote.route';
import { LeaderboardRoutes } from '../modules/Leaderboard/Leaderboard.route';

const router = express.Router();

const moduleRoutes = [
  { path: '/auth', route: AuthRouters },
  { path: '/admin/employees', route: UsersRoutes },
  { path: '/reports', route: ReportRoutes },
  { path: '/leaderboard', route: LeaderboardRoutes },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

// Nested routes: /reports/:id/comments and /reports/:id/vote
router.use('/reports/:id/comments', CommentRoutes);
router.use('/reports/:id/vote', VoteRoutes);

export default router;
