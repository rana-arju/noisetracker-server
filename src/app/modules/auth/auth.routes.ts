import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { authValidation } from "./auth.validation";
import { AuthControllers } from "./auth.controller";
import auth from '../../middlewares/auth';
import { Role } from '@prisma/client';

const router = express.Router();

router.post(
  "/login",
  validateRequest(authValidation.loginUser),
  AuthControllers.loginUser
);

router.post(
  "/refresh-token",
  validateRequest(authValidation.refreshToken),
  AuthControllers.refreshToken
);

router.post(
  "/change-password",
  auth(Role.SUPERADMIN, Role.ADMIN, Role.EMPLOYEE),
  validateRequest(authValidation.changePassword),
  AuthControllers.changePassword
);

router.get(
  "/me",
  auth(Role.SUPERADMIN, Role.ADMIN, Role.EMPLOYEE),
  AuthControllers.getMe
);

export const AuthRouters = router;
