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
exports.LeaderboardServices = void 0;
const prisma_1 = __importDefault(require("../../lib/prisma"));
const date_fns_1 = require("date-fns");
const getLeaderboard = (filters) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    let startDate;
    let endDate;
    if (filters.month) {
        const [year, month] = filters.month.split('-').map(Number);
        startDate = (0, date_fns_1.startOfMonth)(new Date(year, month - 1, 1));
        endDate = (0, date_fns_1.endOfMonth)(new Date(year, month - 1, 1));
    }
    else if (filters.range === 'last-month') {
        const now = new Date();
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        startDate = (0, date_fns_1.startOfMonth)(lastMonth);
        endDate = (0, date_fns_1.endOfMonth)(lastMonth);
    }
    else {
        // Default: current month
        const now = new Date();
        startDate = (0, date_fns_1.startOfMonth)(now);
        endDate = (0, date_fns_1.endOfDay)(now);
    }
    // Get approved reports in the date range, grouped by reportedEmployeeId/Name
    const reports = yield prisma_1.default.report.findMany({
        where: {
            status: 'APPROVED',
            createdAt: { gte: startDate, lte: endDate },
        },
        select: {
            reportedEmployeeName: true,
            reportedEmployeeId: true,
            id: true,
        },
    });
    // Aggregate counts by employee
    const employeeMap = {};
    for (const report of reports) {
        const key = (_a = report.reportedEmployeeId) !== null && _a !== void 0 ? _a : report.reportedEmployeeName;
        if (!employeeMap[key]) {
            employeeMap[key] = {
                name: report.reportedEmployeeName,
                employeeId: report.reportedEmployeeId,
                count: 0,
            };
        }
        employeeMap[key].count += 1;
    }
    const leaderboard = Object.values(employeeMap)
        .sort((a, b) => b.count - a.count)
        .map((entry, index) => ({
        rank: index + 1,
        reportedEmployeeName: entry.name,
        reportedEmployeeId: entry.employeeId,
        totalReports: entry.count,
    }));
    return {
        period: { startDate, endDate },
        data: leaderboard,
    };
});
const getEmployeePublicProfile = (id) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if it's a valid MongoDB ObjectId (24 char hex)
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);
    const user = yield prisma_1.default.user.findFirst({
        where: {
            OR: [
                ...(isObjectId ? [{ id }] : []),
                { employeeId: id },
            ],
        },
        select: {
            id: true,
            employeeId: true,
            name: true,
            role: true,
            createdAt: true,
        },
    });
    if (!user)
        return null;
    // Lifetime reports against this employee
    const reports = yield prisma_1.default.report.findMany({
        where: {
            reportedEmployeeId: user.id,
            status: 'APPROVED',
        },
        select: {
            id: true,
            description: true,
            severity: true,
            createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
    });
    const totalReports = reports.length;
    const severityCounts = reports.reduce((acc, r) => {
        acc[r.severity] = (acc[r.severity] || 0) + 1;
        return acc;
    }, {});
    return {
        user: { id: user.id, employeeId: user.employeeId, name: user.name, role: user.role, joinedAt: user.createdAt },
        stats: { totalReports, severityCounts },
        reports,
    };
});
exports.LeaderboardServices = { getLeaderboard, getEmployeePublicProfile };
