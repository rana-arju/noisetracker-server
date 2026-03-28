import express from 'express';
import auth from '../../middlewares/auth';
import { Role } from '@prisma/client';
import { VoteControllers } from './Vote.controller';

const router = express.Router({ mergeParams: true });

// POST /api/v1/reports/:id/vote
router.post('/', auth(Role.EMPLOYEE, Role.ADMIN, Role.SUPERADMIN), VoteControllers.castVote);

// DELETE /api/v1/reports/:id/vote
router.delete('/', auth(Role.EMPLOYEE, Role.ADMIN, Role.SUPERADMIN), VoteControllers.removeVote);

export const VoteRoutes = router;
