import * as bcrypt from 'bcrypt';
import httpStatus from 'http-status';
import { Secret } from 'jsonwebtoken';
import config from '../../../config';
import ApiError from '../../errors/ApiError';
import prisma from '../../lib/prisma';
import { IChangePassword, IUserLogin, RefreshPayload } from './auth.interface ';
import { jwtHelpers } from '../../helpers/jwtHelpers';
import { Role, UserStatus } from '@prisma/client';
import { verifyToken } from '../../utils/verifyToken';

const loginUserFromDB = async (payload: IUserLogin) => {
  const user = await prisma.user.findUnique({
    where: {
      employeeId: payload.employeeId,
    },
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  if (user.status === UserStatus.BLOCKED || !user.isActive) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Your account is not active. Please contact admin.');
  }

  const isCorrectPassword = await bcrypt.compare(payload.password, user.password);

  if (!isCorrectPassword) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Password incorrect');
  }

  const jwtPayload = {
    id: user.id,
    employeeId: user.employeeId,
    role: user.role,
  };

  const accessToken = jwtHelpers.generateToken(
    jwtPayload,
    config.jwt.access_secret as Secret,
    config.jwt.access_expires_in as string
  );

  const refreshToken = jwtHelpers.generateToken(
    jwtPayload,
    config.jwt.refresh_secret as string,
    config.jwt.refresh_expires_in as string
  );

  return {
    user: {
      id: user.id,
      employeeId: user.employeeId,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    },
    accessToken,
    refreshToken,
  };
};

const changePassword = async (userId: string, payload: IChangePassword) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  const isCorrectPassword = await bcrypt.compare(payload.oldPassword, user.password);

  if (!isCorrectPassword) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Old password incorrect');
  }

  const hashedPassword = await bcrypt.hash(payload.newPassword, Number(config.bcrypt_salt_rounds));

  await prisma.user.update({
    where: { id: userId },
    data: {
      password: hashedPassword,
    },
  });

  return {
    message: 'Password updated successfully',
  };
};

const refreshToken = async (token: string) => {
  const decoded = verifyToken(token, config.jwt.refresh_secret as string) as RefreshPayload;

  const { employeeId } = decoded;

  const user = await prisma.user.findUnique({
    where: { employeeId },
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  if (user.status === UserStatus.BLOCKED || !user.isActive) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Account is not active');
  }

  const jwtPayload = {
    id: user.id,
    employeeId: user.employeeId,
    role: user.role,
  };

  const accessToken = jwtHelpers.generateToken(
    jwtPayload,
    config.jwt.access_secret as string,
    config.jwt.access_expires_in as string
  );

  const newRefreshToken = jwtHelpers.generateToken(
    jwtPayload,
    config.jwt.refresh_secret as string,
    config.jwt.refresh_expires_in as string
  );

  return {
    accessToken,
    refreshToken: newRefreshToken,
  };
};

export const AuthServices = {
  loginUserFromDB,
  changePassword,
  refreshToken,
};
