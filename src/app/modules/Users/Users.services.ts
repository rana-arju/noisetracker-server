import httpStatus from 'http-status';
import prisma from '../../lib/prisma';
import { Prisma, Role, UserStatus } from '@prisma/client';
import type { IPaginationOptions } from '../../interface/pagination.type';
import { paginationHelper } from '../../helpers/paginationHelper';
import ApiError from '../../errors/ApiError';

const getAllUsersFromDB = async (filters: any, options: IPaginationOptions) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { search, role, status } = filters;

  const andConditions: Prisma.UserWhereInput[] = [];

  if (search) {
    andConditions.push({
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { employeeId: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ],
    });
  }

  if (role && role !== 'all') {
    andConditions.push({ role: role as Role });
  }

  if (status && status !== 'all') {
    andConditions.push({ status: status as UserStatus });
  }

  const whereConditions: Prisma.UserWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.user.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy: options.sortBy && options.sortOrder
      ? { [options.sortBy]: options.sortOrder }
      : { createdAt: 'desc' },
    select: {
      id: true,
      employeeId: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      status: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const total = await prisma.user.count({
    where: whereConditions,
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
    data: result,
  };
};

const getSingleUserFromDB = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      employeeId: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      status: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  return user;
};

const updateUserInfoIntoDB = async (id: string, payload: any) => {
  const existingUser = await prisma.user.findUnique({
    where: { id },
  });

  if (!existingUser) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  const result = await prisma.user.update({
    where: { id },
    data: payload,
    select: {
      id: true,
      employeeId: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      status: true,
      isActive: true,
    },
  });

  return result;
};

const deleteUserFromDB = async (id: string) => {
  const existingUser = await prisma.user.findUnique({
    where: { id },
  });

  if (!existingUser) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  const result = await prisma.user.delete({
    where: { id },
  });

  return result;
};

const getMyProfileFromDB = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      employeeId: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      status: true,
      isActive: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  return user;
};

export const UsersService = {
  getAllUsersFromDB,
  getSingleUserFromDB,
  updateUserInfoIntoDB,
  deleteUserFromDB,
  getMyProfileFromDB,
};
