import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../helpers/catchAsync';
import sendResponse from '../../helpers/sendResponse';
import pickValidFields from '../../shared/pickValidFields';
import { ReportServices } from './Report.services';

const createReport = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = await ReportServices.createReportIntoDB(user.id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Report created successfully. It will be visible after approval.',
    data: result,
  });
});

const getAllReports = catchAsync(async (req: Request, res: Response) => {
  const filters = pickValidFields(req.query, ['search', 'status', 'severity']);
  const options = pickValidFields(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
  const user = (req as any).user;

  const result = await ReportServices.getAllReportsFromDB(filters, options, user);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Reports fetched successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getSingleReport = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = (req as any).user;
  const result = await ReportServices.getSingleReportFromDB(id as string, user);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Report fetched successfully',
    data: result,
  });
});

const approveReport = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ReportServices.approveReportIntoDB(id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Report approved successfully',
    data: result,
  });
});

const updateReport = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ReportServices.updateReportIntoDB(id as string, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Report updated successfully',
    data: result,
  });
});

const deleteReport = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ReportServices.deleteReportFromDB(id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Report deleted successfully',
    data: result,
  });
});

export const ReportControllers = {
  createReport,
  getAllReports,
  getSingleReport,
  approveReport,
  updateReport,
  deleteReport,
};
