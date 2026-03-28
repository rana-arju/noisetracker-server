import { Request, Response } from 'express';
import httpStatus from 'http-status';
import config from '../../../config';

import { AuthServices } from './auth.service';
import catchAsync from '../../helpers/catchAsync';
import sendResponse from '../../helpers/sendResponse';

const loginUser = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthServices.loginUserFromDB(req.body);
  const { refreshToken, accessToken, user } = result;

  res.cookie('refreshToken', refreshToken, {
    secure: config.env === 'production',
    httpOnly: true,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Login successful',
    data: {
      accessToken,
      user,
    },
  });
});

const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const { refreshToken } = req.cookies;
  const result = await AuthServices.refreshToken(refreshToken);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Access token retrieved successfully',
    data: result,
  });
});

const changePassword = catchAsync(async (req: Request, res: Response) => {
  const { user } = req as any;
  const result = await AuthServices.changePassword(user.id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Password changed successfully',
    data: result,
  });
});

const getMe = catchAsync(async (req: Request, res: Response) => {
  const { user } = req as any;
  
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User data retrieved successfully',
    data: user,
  });
});

export const AuthControllers = {
  loginUser,
  refreshToken,
  changePassword,
  getMe,
};
