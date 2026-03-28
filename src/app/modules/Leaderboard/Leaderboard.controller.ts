import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../helpers/catchAsync';
import sendResponse from '../../helpers/sendResponse';
import { LeaderboardServices } from './Leaderboard.services';

const getLeaderboard = catchAsync(async (req: Request, res: Response) => {
  const { range, month } = req.query as { range?: any; month?: string };
  const result = await LeaderboardServices.getLeaderboard({ range, month });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Leaderboard fetched successfully',
    data: result,
  });
});

const getEmployeeProfile = catchAsync(async (req: Request, res: Response) => {
  const { employeeId } = req.params;
  const result = await LeaderboardServices.getEmployeePublicProfile(employeeId as string);

  sendResponse(res, {
    statusCode: result ? httpStatus.OK : httpStatus.NOT_FOUND,
    success: !!result,
    message: result ? 'Profile fetched successfully' : 'Employee not found',
    data: result,
  });
});

export const LeaderboardControllers = { getLeaderboard, getEmployeeProfile };
