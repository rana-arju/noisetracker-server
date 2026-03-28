import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../helpers/catchAsync';
import sendResponse from '../../helpers/sendResponse';
import pickValidFields from '../../shared/pickValidFields';
import { CommentServices } from './Comment.services';

const createComment = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = await CommentServices.createCommentIntoDB(user.id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Comment added successfully',
    data: result,
  });
});

const getCommentsByReportId = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const options = pickValidFields(req.query, ['limit', 'page']);
  const user = (req as any).user;

  const result = await CommentServices.getCommentsByReportIdFromDB(id as string, options, user);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Comments fetched successfully',
    meta: result.meta,
    data: result.data,
  });
});

export const CommentControllers = {
  createComment,
  getCommentsByReportId,
};
