import { Role, UserStatus } from '@prisma/client';

export interface UserQueryParams {
  page?: number;
  limit?: number;
  search?: string; // Search by name, employeeId
  role?: Role | 'all';
  status?: UserStatus | 'all';
  sortBy?: 'name' | 'employeeId' | 'role' | 'status' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface UserFilterOptions {
  search?: string;
  role?: Role;
  status?: UserStatus;
}

export interface UserListResponse {
  id: string;
  employeeId: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  role: Role;
  status: UserStatus;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPaginatedResponse {
  data: UserListResponse[];
  meta: {
    total: number;
    page: number;
    totalPage: number;
    limit: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}
