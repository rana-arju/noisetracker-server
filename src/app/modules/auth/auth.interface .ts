import { Role } from "@prisma/client";

export type IJwtPayload = {
  id: string;
  employeeId: string;
  role: Role;
};

export type RefreshPayload = {
  id: string;
  employeeId: string;
  role: Role;
  iat: number;
  exp: number;
};

export interface IUserLogin {
  employeeId: string;
  password: string;
}

export interface IChangePassword {
  newPassword: string;
  oldPassword: string;
}
