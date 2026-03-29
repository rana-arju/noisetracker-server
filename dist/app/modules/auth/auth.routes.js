"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRouters = void 0;
const express_1 = __importDefault(require("express"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const auth_validation_1 = require("./auth.validation");
const auth_controller_1 = require("./auth.controller");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const client_1 = require("@prisma/client");
const router = express_1.default.Router();
router.post("/login", (0, validateRequest_1.default)(auth_validation_1.authValidation.loginUser), auth_controller_1.AuthControllers.loginUser);
router.post("/refresh-token", (0, validateRequest_1.default)(auth_validation_1.authValidation.refreshToken), auth_controller_1.AuthControllers.refreshToken);
router.post("/change-password", (0, auth_1.default)(client_1.Role.SUPERADMIN, client_1.Role.ADMIN, client_1.Role.EMPLOYEE), (0, validateRequest_1.default)(auth_validation_1.authValidation.changePassword), auth_controller_1.AuthControllers.changePassword);
router.get("/me", (0, auth_1.default)(client_1.Role.SUPERADMIN, client_1.Role.ADMIN, client_1.Role.EMPLOYEE), auth_controller_1.AuthControllers.getMe);
exports.AuthRouters = router;
