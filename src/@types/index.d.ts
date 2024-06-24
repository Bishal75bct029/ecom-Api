interface UserJwtPayload {
  id: string;
  role: string;
}

type UserRole = 'ADMIN' | 'USER';
