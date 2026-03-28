import { z } from 'zod';

const loginUser = z.object({
  body: z.object({
    employeeId: z.string({
      required_error: 'Employee ID is required',
    }),
    password: z.string({
      required_error: 'Password is required',
    }),
  }),
});

const refreshToken = z.object({
  cookies: z.object({
    refreshToken: z.string({
      required_error: 'Refresh token is required!',
    }),
  }),
});

const changePassword = z.object({
  body: z.object({
    oldPassword: z.string({
      required_error: 'Old password is required',
    }),
    newPassword: z.string({
      required_error: 'New password is required',
    }),
  }),
});

export const authValidation = {
  loginUser,
  refreshToken,
  changePassword,
};
