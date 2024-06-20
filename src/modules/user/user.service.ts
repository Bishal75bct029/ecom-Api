import { Injectable } from '@nestjs/common';
import { AbstractService } from '@/libs/service/abstract.service';
import { UserEntity } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtPayload } from '@/common/middlewares/admin/admin.middleware';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';

@Injectable()
export class UserService extends AbstractService<UserEntity> {
  constructor(
    @InjectRepository(UserEntity) private readonly itemRepository: Repository<UserEntity>,
    private readonly jwtService: JwtService,
  ) {
    super(itemRepository);
  }

  async generateAuthTokens(user: JwtPayload) {
    return Promise.all([
      this.jwtService.signAsync({ id: user.id, role: user.role }, { expiresIn: '2m' }),
      this.jwtService.signAsync({ id: user.id, role: user.role }, { expiresIn: '5d' }),
    ]);
  }

  setCookie(res: Response, token: string, refreshToken: string) {
    res.cookie('x-auth-cookie', token, { httpOnly: true, maxAge: 2 * 60 * 1000, secure: true });
    res.cookie('x-refresh-cookie', refreshToken, { httpOnly: true, maxAge: 5 * 24 * 60 * 60 * 1000, secure: true });
  }
}
