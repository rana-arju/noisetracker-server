import httpStatus from 'http-status';
import ApiError from '../../errors/ApiError';
import prisma from '../../lib/prisma';
import { VoteType } from '@prisma/client';

const castVote = async (userId: string, reportId: string, voteType: VoteType) => {
  const report = await prisma.report.findUnique({ where: { id: reportId } });
  if (!report) throw new ApiError(httpStatus.NOT_FOUND, 'Report not found');

  // Check existing vote
  const existingVote = await prisma.reportVote.findUnique({
    where: { reportId_userId: { reportId, userId } },
  });

  if (existingVote) {
    if (existingVote.voteType === voteType) {
      // Same vote — remove it (toggle off)
      await prisma.reportVote.delete({
        where: { reportId_userId: { reportId, userId } },
      });
      return { currentUserVote: null, message: 'Vote removed' };
    } else {
      // Different vote — switch it
      const updated = await prisma.reportVote.update({
        where: { reportId_userId: { reportId, userId } },
        data: { voteType },
      });
      return { currentUserVote: updated.voteType, message: 'Vote updated' };
    }
  }

  // New vote
  const created = await prisma.reportVote.create({
    data: { reportId, userId, voteType },
  });

  return { currentUserVote: created.voteType, message: 'Vote cast' };
};

const removeVote = async (userId: string, reportId: string) => {
  const existingVote = await prisma.reportVote.findUnique({
    where: { reportId_userId: { reportId, userId } },
  });

  if (!existingVote) throw new ApiError(httpStatus.NOT_FOUND, 'No vote found to remove');

  await prisma.reportVote.delete({
    where: { reportId_userId: { reportId, userId } },
  });

  return { currentUserVote: null, message: 'Vote removed' };
};

const getVoteSummary = async (reportId: string, userId?: string) => {
  const [upvotes, downvotes] = await Promise.all([
    prisma.reportVote.count({ where: { reportId, voteType: 'UPVOTE' } }),
    prisma.reportVote.count({ where: { reportId, voteType: 'DOWNVOTE' } }),
  ]);

  let currentUserVote: VoteType | null = null;
  if (userId) {
    const vote = await prisma.reportVote.findUnique({
      where: { reportId_userId: { reportId, userId } },
    });
    currentUserVote = vote?.voteType ?? null;
  }

  return { totalUpvotes: upvotes, totalDownvotes: downvotes, currentUserVote };
};

export const VoteServices = { castVote, removeVote, getVoteSummary };
