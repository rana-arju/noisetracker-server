import { Prisma } from '@prisma/client';
import httpStatus from 'http-status';
import ApiError from '../../errors/ApiError';
import prisma from '../../lib/prisma';
import { ICreateComment } from './Comment.interface';
import { paginationHelper } from '../../helpers/paginationHelper';
import crypto from 'crypto';

const getAnonymousName = (userId: string) => {
  const adjs = ['Swift', 'Quiet', 'Smart', 'Bright', 'Brave', 'Calm', 'Brisk', 'Cool', 'Daily', 'Early'];
  const nouns = ['Contributor', 'Peer', 'Mate', 'Associate', 'Colleague', 'Ally', 'Partner', 'Friend', 'Voice', 'Mind'];
  
  const hash = crypto.createHash('md5').update(userId).digest('hex');
  const adjIndex = parseInt(hash.substring(0, 2), 16) % adjs.length;
  const nounIndex = parseInt(hash.substring(2, 4), 16) % nouns.length;
  const num = parseInt(hash.substring(4, 7), 16) % 100;

  return `${adjs[adjIndex]} ${nouns[nounIndex]} ${num.toString().padStart(2, '0')}`;
};

const createCommentIntoDB = async (userId: string, payload: ICreateComment) => {
  const report = await prisma.report.findUnique({
    where: { id: payload.reportId },
  });

  if (!report) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Report not found');
  }

  const result = await prisma.comment.create({
    data: {
      ...payload,
      userId,
    },
    include: {
      user: true,
    },
  });

  return result;
};

const getCommentsByReportIdFromDB = async (reportId: string, options: any, currentUser?: any) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);

  const isAdmin = currentUser && (currentUser.role === 'ADMIN' || currentUser.role === 'SUPERADMIN' || (currentUser as any).role === 'ADMIN' || (currentUser as any).role === 'SUPERADMIN');

  const result = await prisma.comment.findMany({
    where: { reportId },
    skip,
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      user: true,
    },
  });

  const total = await prisma.comment.count({
    where: { reportId },
  });

  const comments = result.map((comment) => {
    const commentData: any = {
      ...comment,
      anonymousCommenterName: getAnonymousName(comment.userId),
    };

    if (!isAdmin) {
      delete commentData.user;
      delete commentData.userId;
    }

    return commentData;
  });

  return {
    meta: {
      total,
      page,
      limit,
      totalPage: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPreviousPage: page > 1,
    },
    data: comments,
  };
};

export const CommentServices = {
  createCommentIntoDB,
  getCommentsByReportIdFromDB,
};
