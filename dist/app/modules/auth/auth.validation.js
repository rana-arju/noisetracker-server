"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authValidation = void 0;
const zod_1 = require("zod");
const loginUser = zod_1.z.object({
    body: zod_1.z.object({
        employeeId: zod_1.z.string({
            required_error: 'Employee ID is required',
        }),
        password: zod_1.z.string({
            required_error: 'Password is required',
        }),
    }),
});
const refreshToken = zod_1.z.object({
    cookies: zod_1.z.object({
        refreshToken: zod_1.z.string({
            required_error: 'Refresh token is required!',
        }),
    }),
});
const changePassword = zod_1.z.object({
    body: zod_1.z.object({
        oldPassword: zod_1.z.string({
            required_error: 'Old password is required',
        }),
        newPassword: zod_1.z.string({
            required_error: 'New password is required',
        }),
    }),
});
exports.authValidation = {
    loginUser,
    refreshToken,
    changePassword,
};
