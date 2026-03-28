export interface ICreateComment {
  reportId: string;
  content: string;
}

export interface ICommentResponse {
  id: string;
  reportId: string;
  userId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Anonymous for public, Real for Admin
  anonymousCommenterName: string;
  user?: {
    id: string;
    employeeId: string;
    name?: string | null;
  };
}
