import { ReportStatus, Severity, VoteType } from '@prisma/client';

export interface ReportQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: ReportStatus | 'all';
  severity?: Severity | 'all';
  sortBy?: 'createdAt' | 'reportedEmployeeName' | 'severity';
  sortOrder?: 'asc' | 'desc';
}

export interface ICreateReport {
  reportedEmployeeName: string;
  reportedEmployeeId?: string;
  description?: string;
  severity?: Severity;
}

export interface IReportResponse {
  id: string;
  reportedEmployeeName: string;
  reportedEmployeeId?: string | null;
  description?: string | null;
  severity: Severity;
  status: ReportStatus;
  createdAt: Date;
  updatedAt: Date;
  
  // Aggregated data
  totalUpvotes: number;
  totalDownvotes: number;
  totalComments: number;
  
  // User specific
  currentUserVote?: VoteType | null;
  
  // Identity (Anonymous for public, Real for Admin)
  anonymousReporterName: string;
  reporter?: {
    id: string;
    employeeId: string;
    name?: string | null;
  };
}
