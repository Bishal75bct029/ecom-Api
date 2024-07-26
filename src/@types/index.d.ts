interface UserJwtPayload {
  id?: string;
  role?: UserRole;
  schoolId?: string;
}

type UserRole = 'ADMIN' | 'USER';
