import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { UsersService } from './Users.services';
import { UsersBulkService } from './Users.bulk.service';
import catchAsync from '../../helpers/catchAsync';
import ApiError from '../../errors/ApiError';
import sendResponse from '../../helpers/sendResponse';
import pickValidFields from '../../shared/pickValidFields';

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const filters = pickValidFields(req.query, ['search', 'role', 'status']);
  const options = pickValidFields(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);

  const result = await UsersService.getAllUsersFromDB(filters, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Users fetched successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getSingleUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await UsersService.getSingleUserFromDB(id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User fetched successfully',
    data: result,
  });
});

const updateUserInfo = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await UsersService.updateUserInfoIntoDB(id as string, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User updated successfully',
    data: result,
  });
});

const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await UsersService.deleteUserFromDB(id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User deleted successfully',
    data: result,
  });
});

const getMyProfile = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = await UsersService.getMyProfileFromDB(user.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Profile fetched successfully',
    data: result,
  });
});

const bulkUploadEmployees = catchAsync(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Please upload a file');
  }

  const filePath = req.file.path;
  const fileExtension = req.file.originalname.split('.').pop()?.toLowerCase();
  
  const result = await UsersBulkService.bulkUploadEmployees(
    filePath,
    fileExtension === 'csv' ? 'csv' : 'excel'
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Bulk upload completed',
    data: result,
  });
});

export const UsersController = {
  getAllUsers,
  getSingleUser,
  updateUserInfo,
  deleteUser,
  getMyProfile,
  bulkUploadEmployees,
};
