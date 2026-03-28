import { NextFunction, Request, Response } from "express";
import { JwtPayload, Secret } from "jsonwebtoken";
import config from "../../config";
import httpStatus from "http-status";

import { jwtHelpers } from "../helpers/jwtHelpers";
import prisma from "../lib/prisma";
import { UserStatus } from "@prisma/client";
import ApiError from "../errors/ApiError";

const auth = (...roles: string[]) => {
  return async (
    req: Request & { user?: any },
    res: Response,
    next: NextFunction
  ) => {
    try {
      const headersAuth = req.headers.authorization;
      
      if (!headersAuth || !headersAuth.startsWith("Bearer ")) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid authorization format!");
      }
      const token: string | undefined = headersAuth?.split(' ')[1]
      
      if (!token) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "You are not authorized!");
      }

      const verifiedUser = jwtHelpers.verifyToken(
        token,
        config.jwt.access_secret as Secret
      );
      
      if (!verifiedUser?.id) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "You are not authorized!");
      }

      const user = await prisma.user.findUnique({
        where: { id: verifiedUser.id },
      });

      if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, "User not found!");
      }

      if (user.status === UserStatus.BLOCKED) {
        throw new ApiError(httpStatus.FORBIDDEN, 'Your account is blocked!');
      }
      if (!user.isActive) {
        throw new ApiError(httpStatus.FORBIDDEN, 'Your account is inactive!');
      }

      // Attach full user details to request
      req.user = {
        id: user.id,
        employeeId: user.employeeId,
        role: user.role,
        name: user.name,
        email: user.email,
      };

      if (roles.length && !roles.includes(user.role)) {
        throw new ApiError(httpStatus.FORBIDDEN, "Forbidden! You are not authorized!");
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};

export const checkOTP = async (
  req: Request & { user?: any },
  res: Response,
  next: NextFunction
) => {
  try {
    const headersAuth = req.headers.authorization;
    if (!headersAuth || !headersAuth.startsWith("Bearer ")) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid authorization format!");
    }
    const token: string | undefined = headersAuth?.split(' ')[1]
    if (!token) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "You are not authorized!");
    }

    const verifiedUser = jwtHelpers.verifyToken(
      token,
      config.jwt.reset_pass_secret as Secret
    );

    if (!verifiedUser?.id) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "You are not authorized!");
    }
    const { id } = verifiedUser;

    const user = await prisma.user.findUnique({
      where: {
        id: id,
      },
    });
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, "User not found!");
    }

    req.user = verifiedUser as JwtPayload;
    next();
  } catch (err) {
    next(err);
  }
};

export const optionalAuth = (...roles: string[]) => {
  return async (
    req: Request & { user?: any },
    res: Response,
    next: NextFunction
  ) => {
    try {
      const headersAuth = req.headers.authorization;
      const token: string | undefined = headersAuth?.split(' ')[1]

      if (!token) {
        // No token provided, proceed without authentication
        return next();
      }

      const verifiedUser = jwtHelpers.verifyToken(
        token,
        config.jwt.access_secret as Secret
      );

      if (!verifiedUser?.email) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'You are not authorized!');
      }
      const { id } = verifiedUser;

      const user = await prisma.user.findUnique({
        where: { id },
      });

      if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, 'User not found!');
      }

      if (user.status === UserStatus.BLOCKED) {
        throw new ApiError(httpStatus.FORBIDDEN, 'Your account is blocked!');
      }

      req.user = verifiedUser as JwtPayload;

      if (roles.length && !roles.includes(verifiedUser.role)) {
        throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden!');
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};


export default auth;
