import express from 'express';
import auth from '../../middlewares/auth';
import { Role } from '@prisma/client';
import { UsersController } from './Users.controller';
import { fileUploader } from '../../middlewares/multerFileUpload';

const router = express.Router();

router.get('/me', auth(Role.EMPLOYEE, Role.ADMIN, Role.SUPERADMIN), UsersController.getMyProfile);
router.patch('/me', auth(Role.EMPLOYEE, Role.ADMIN, Role.SUPERADMIN), UsersController.updateMyProfile);

// Public search — any authenticated user can search for users to report
router.get('/search', auth(Role.EMPLOYEE, Role.ADMIN, Role.SUPERADMIN), UsersController.searchUsers);

// Admin routes
router.get('/', auth(Role.ADMIN, Role.SUPERADMIN), UsersController.getAllUsers);
router.post(
  '/preview-upload',
  auth(Role.ADMIN, Role.SUPERADMIN),
  fileUploader.excelUpload,
  UsersController.previewBulkUpload
);
router.post(
  '/confirm-upload',
  auth(Role.ADMIN, Role.SUPERADMIN),
  UsersController.confirmBulkUpload
);
router.post('/', auth(Role.ADMIN, Role.SUPERADMIN), UsersController.createUser);
router.get('/:id', auth(Role.ADMIN, Role.SUPERADMIN), UsersController.getSingleUser);
router.patch('/:id', auth(Role.ADMIN, Role.SUPERADMIN), UsersController.updateUserInfo);
router.delete('/:id', auth(Role.ADMIN, Role.SUPERADMIN), UsersController.deleteUser);

export const UsersRoutes = router;
