export interface UserJwtPayload {
  id?: string;
  email?: string;
  role?: UserRole;
  schoolId?: string;
}

export type UserRole = 'ADMIN' | 'USER';
