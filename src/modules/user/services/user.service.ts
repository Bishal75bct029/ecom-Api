import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserRepository } from '../repositories/user.repository';

@Injectable()
export class UserService extends UserRepository {
  comparePassword(password: string, hashPassword: string) {
    return bcrypt.compareSync(password, hashPassword);
  }

  generateOtp() {
    const minm = 100000;
    const maxm = 999999;
    return (Math.floor(Math.random() * (maxm - minm + 1)) + minm).toString();
  }
}
