import express from 'express';
import auth from '../../middlewares/auth';
import { Role } from '@prisma/client';
import { CommentControllers } from './Comment.controller';

const router = express.Router({ mergeParams: true });

// POST /api/v1/reports/:id/comments
router.post(
  '/',
  auth(Role.EMPLOYEE, Role.ADMIN, Role.SUPERADMIN),
  CommentControllers.createComment
);

// GET /api/v1/reports/:id/comments
router.get(
  '/',
  auth(Role.EMPLOYEE, Role.ADMIN, Role.SUPERADMIN),
  CommentControllers.getCommentsByReportId
);

export const CommentRoutes = router;
