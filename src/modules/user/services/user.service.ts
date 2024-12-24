import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AbstractService } from '@/libs/service/abstract.service';
import { UserEntity } from '../entities';

@Injectable()
export class UserService extends AbstractService<UserEntity> {
  constructor(@InjectRepository(UserEntity) private readonly itemRepository: Repository<UserEntity>) {
    super(itemRepository);
  }

  comparePassword(password: string, hashPassword: string) {
    return bcrypt.compareSync(password, hashPassword);
  }

  generateOtp() {
    const minm = 100000;
    const maxm = 999999;
    return (Math.floor(Math.random() * (maxm - minm + 1)) + minm).toString();
  }
}
