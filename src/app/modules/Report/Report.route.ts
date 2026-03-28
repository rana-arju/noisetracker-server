import express from 'express';
import auth from '../../middlewares/auth';
import { Role } from '@prisma/client';
import { ReportControllers } from './Report.controller';

const router = express.Router();

router.post(
  '/',
  auth(Role.EMPLOYEE, Role.ADMIN, Role.SUPERADMIN),
  ReportControllers.createReport
);

router.get(
  '/',
  auth(Role.EMPLOYEE, Role.ADMIN, Role.SUPERADMIN),
  ReportControllers.getAllReports
);

router.get(
  '/:id',
  auth(Role.EMPLOYEE, Role.ADMIN, Role.SUPERADMIN),
  ReportControllers.getSingleReport
);

// Admin routes
router.patch(
  '/admin/:id/approve',
  auth(Role.ADMIN, Role.SUPERADMIN),
  ReportControllers.approveReport
);

router.patch(
  '/admin/:id',
  auth(Role.ADMIN, Role.SUPERADMIN),
  ReportControllers.updateReport
);

router.delete(
  '/admin/:id',
  auth(Role.ADMIN, Role.SUPERADMIN),
  ReportControllers.deleteReport
);

export const ReportRoutes = router;
