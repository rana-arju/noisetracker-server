import { Prisma, ReportStatus, Severity, VoteType } from '@prisma/client';
import httpStatus from 'http-status';
import ApiError from '../../errors/ApiError';
import prisma from '../../lib/prisma';
import { ICreateReport } from './Report.interface';
import { paginationHelper } from '../../helpers/paginationHelper';
import crypto from 'crypto';

const getAnonymousName = (userId: string | null, createdAt: Date) => {
  const adjs = ['Silent', 'Brave', 'Swift', 'Calm', 'Bright', 'Wise', 'Bold', 'Mystic', 'Hidden', 'Steady'];
  const nouns = ['Observer', 'Member', 'Patrol', 'Guardian', 'Tracker', 'Sentinel', 'Whistle', 'Spirit', 'Echo', 'Watch'];
  
  // Use a hash of userId + year-month to keep it stable but rotating or just userId for full stability
  const hash = crypto.createHash('md5').update(userId || 'anonymous').digest('hex');
  const adjIndex = parseInt(hash.substring(0, 2), 16) % adjs.length;
  const nounIndex = parseInt(hash.substring(2, 4), 16) % nouns.length;
  const num = parseInt(hash.substring(4, 7), 16) % 100;

  return `${adjs[adjIndex]} ${nouns[nounIndex]} ${num.toString().padStart(2, '0')}`;
};

const createReportIntoDB = async (userId: string, payload: ICreateReport) => {
  const result = await prisma.report.create({
    data: {
      ...payload,
      severity: payload.severity ? (payload.severity.toUpperCase() as Severity) : Severity.MEDIUM,
      createdById: userId,
      status: ReportStatus.PENDING,
    },
    include: {
      createdBy: true,
    },
  });

  return result;
};

const getAllReportsFromDB = async (filters: any, options: any, currentUser?: any) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { search, status, severity } = filters;

  const andConditions: Prisma.ReportWhereInput[] = [];

  if (search) {
    andConditions.push({
      OR: [
        { reportedEmployeeName: { contains: search, mode: 'insensitive' } },
        { reportedEmployeeId: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ],
    });
  }

  // If not admin, only show approved reports
  const isAdmin = currentUser && (currentUser.role === 'ADMIN' || currentUser.role === 'SUPERADMIN' || (currentUser as any).role === 'ADMIN' || (currentUser as any).role === 'SUPERADMIN');
  
  if (!isAdmin) {
    andConditions.push({ status: ReportStatus.APPROVED });
  } else if (status && status !== 'all') {
    andConditions.push({ status: status.toUpperCase() as ReportStatus });
  }

  if (severity && severity !== 'all') {
    andConditions.push({ severity: severity.toUpperCase() as Severity });
  }

  const whereConditions: Prisma.ReportWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.report.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy: options.sortBy && options.sortOrder
      ? { [options.sortBy]: options.sortOrder }
      : { createdAt: 'desc' },
    include: {
      createdBy: true,
      _count: {
        select: {
          comments: true,
          votes: true,
        },
      },
      votes: currentUser ? {
        where: { userId: currentUser.id },
      } : false,
    },
  });

  const total = await prisma.report.count({
    where: whereConditions,
  });

  // Calculate votes and anonymize
  const reports = await Promise.all(result.map(async (report) => {
    const upvotes = await prisma.reportVote.count({
      where: { reportId: report.id, voteType: VoteType.UPVOTE },
    });
    const downvotes = await prisma.reportVote.count({
      where: { reportId: report.id, voteType: VoteType.DOWNVOTE },
    });

    const reportData: any = {
      ...report,
      totalUpvotes: upvotes,
      totalDownvotes: downvotes,
      totalComments: report._count.comments,
      currentUserVote: report.votes?.[0]?.voteType || null,
      anonymousReporterName: getAnonymousName(report.createdById, report.createdAt),
    };

    // Remove sensitive data if not admin
    if (!isAdmin) {
      delete reportData.createdBy;
      delete reportData.createdById;
    }

    delete reportData.votes;
    delete reportData._count;

    return reportData;
  }));

  return {
    meta: {
      total,
      page,
      limit,
      totalPage: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPreviousPage: page > 1,
    },
    data: reports,
  };
};

const getSingleReportFromDB = async (id: string, currentUser?: any) => {
  const report = await prisma.report.findUnique({
    where: { id },
    include: {
      createdBy: true,
    },
  });

  if (!report) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Report not found');
  }

  const isAdmin = currentUser && (currentUser.role === 'ADMIN' || currentUser.role === 'SUPERADMIN' || (currentUser as any).role === 'ADMIN' || (currentUser as any).role === 'SUPERADMIN');

  const upvotes = await prisma.reportVote.count({
    where: { reportId: id, voteType: VoteType.UPVOTE },
  });
  const downvotes = await prisma.reportVote.count({
    where: { reportId: id, voteType: VoteType.DOWNVOTE },
  });

  let currentUserVote = null;
  if (currentUser) {
    const vote = await prisma.reportVote.findUnique({
      where: {
        reportId_userId: {
          reportId: id,
          userId: currentUser.id,
        },
      },
    });
    currentUserVote = vote?.voteType || null;
  }

  const reportData: any = {
    ...report,
    totalUpvotes: upvotes,
    totalDownvotes: downvotes,
    currentUserVote,
    anonymousReporterName: getAnonymousName(report.createdById, report.createdAt),
  };

  if (!isAdmin) {
    delete reportData.createdBy;
    delete reportData.createdById;
  }

  return reportData;
};

const approveReportIntoDB = async (id: string) => {
  const result = await prisma.report.update({
    where: { id },
    data: { status: ReportStatus.APPROVED },
  });
  return result;
};

const updateReportIntoDB = async (id: string, payload: any) => {
  const data = { ...payload };
  if (data.severity) data.severity = data.severity.toUpperCase() as Severity;
  if (data.status) data.status = data.status.toUpperCase() as ReportStatus;

  const result = await prisma.report.update({
    where: { id },
    data,
  });
  return result;
};

const deleteReportFromDB = async (id: string) => {
  const result = await prisma.report.delete({
    where: { id },
  });
  return result;
};

export const ReportServices = {
  createReportIntoDB,
  getAllReportsFromDB,
  getSingleReportFromDB,
  approveReportIntoDB,
  updateReportIntoDB,
  deleteReportFromDB,
};
