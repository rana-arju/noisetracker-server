import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { VoteType } from '@prisma/client';
import catchAsync from '../../helpers/catchAsync';
import sendResponse from '../../helpers/sendResponse';
import { VoteServices } from './Vote.services';
import ApiError from '../../errors/ApiError';

const castVote = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { id: reportId } = req.params;
  const { voteType } = req.body;

  if (!voteType || !['UPVOTE', 'DOWNVOTE'].includes(voteType)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'voteType must be UPVOTE or DOWNVOTE');
  }

  const result = await VoteServices.castVote(user.id, reportId as string, voteType as VoteType);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: result,
  });
});

const removeVote = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { id: reportId } = req.params;

  const result = await VoteServices.removeVote(user.id, reportId as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: result,
  });
});

export const VoteControllers = { castVote, removeVote };
