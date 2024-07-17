interface UserJwtPayload {
  id: string;
  role: string;
  schoolId?: string;
}

type UserRole = 'ADMIN' | 'USER';
