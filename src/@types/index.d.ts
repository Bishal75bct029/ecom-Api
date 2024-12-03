interface UserJwtPayload {
  id?: string;
  email?: string;
  role?: UserRole;
  schoolId?: string;
}

type UserRole = 'ADMIN' | 'USER';
