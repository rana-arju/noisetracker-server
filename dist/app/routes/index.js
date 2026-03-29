"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_routes_1 = require("../modules/auth/auth.routes");
const Users_route_1 = require("../modules/Users/Users.route");
const Report_route_1 = require("../modules/Report/Report.route");
const Comment_route_1 = require("../modules/Comment/Comment.route");
const Vote_route_1 = require("../modules/Vote/Vote.route");
const Leaderboard_route_1 = require("../modules/Leaderboard/Leaderboard.route");
const router = express_1.default.Router();
const moduleRoutes = [
    { path: '/auth', route: auth_routes_1.AuthRouters },
    { path: '/admin/employees', route: Users_route_1.UsersRoutes },
    { path: '/reports', route: Report_route_1.ReportRoutes },
    { path: '/leaderboard', route: Leaderboard_route_1.LeaderboardRoutes },
];
moduleRoutes.forEach((route) => router.use(route.path, route.route));
// Nested routes: /reports/:id/comments and /reports/:id/vote
router.use('/reports/:id/comments', Comment_route_1.CommentRoutes);
router.use('/reports/:id/vote', Vote_route_1.VoteRoutes);
exports.default = router;
