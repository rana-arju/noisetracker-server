import prisma from '../../lib/prisma';
import { startOfMonth, endOfMonth, startOfDay, endOfDay } from 'date-fns';

interface LeaderboardFilters {
  month?: string; // e.g. "2026-03"
  range?: 'current-month' | 'last-month';
}

const getLeaderboard = async (filters: LeaderboardFilters) => {
  let startDate: Date;
  let endDate: Date;

  if (filters.month) {
    const [year, month] = filters.month.split('-').map(Number);
    startDate = startOfMonth(new Date(year, month - 1, 1));
    endDate = endOfMonth(new Date(year, month - 1, 1));
  } else if (filters.range === 'last-month') {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    startDate = startOfMonth(lastMonth);
    endDate = endOfMonth(lastMonth);
  } else {
    // Default: current month
    const now = new Date();
    startDate = startOfMonth(now);
    endDate = endOfDay(now);
  }

  // Get approved reports in the date range, grouped by reportedEmployeeId/Name
  const reports = await prisma.report.findMany({
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
  const employeeMap: Record<string, { name: string; employeeId: string | null; count: number }> = {};

  for (const report of reports) {
    const key = report.reportedEmployeeId ?? report.reportedEmployeeName;
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
};

const getEmployeePublicProfile = async (id: string) => {
  // Check if it's a valid MongoDB ObjectId (24 char hex)
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);

  const user = await prisma.user.findFirst({
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

  if (!user) return null;

  // Lifetime reports against this employee
  const reports = await prisma.report.findMany({
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
  const severityCounts = reports.reduce(
    (acc: Record<string, number>, r) => {
      acc[r.severity] = (acc[r.severity] || 0) + 1;
      return acc;
    },
    {}
  );

  return {
    user: { id: user.id, employeeId: user.employeeId, name: user.name, role: user.role, joinedAt: user.createdAt },
    stats: { totalReports, severityCounts },
    reports,
  };
};

export const LeaderboardServices = { getLeaderboard, getEmployeePublicProfile };
