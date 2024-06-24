import { Injectable } from '@nestjs/common';
import { AbstractService } from '@/libs/service/abstract.service';
import { UserEntity } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { envConfig } from '@/configs/envConfig';

@Injectable()
export class UserService extends AbstractService<UserEntity> {
  constructor(
    @InjectRepository(UserEntity) private readonly itemRepository: Repository<UserEntity>,
    private readonly jwtService: JwtService,
  ) {
    super(itemRepository);
  }

  async generateAuthTokens(user: UserJwtPayload) {
    return Promise.all([
      this.jwtService.signAsync({ id: user.id, role: user.role }, { expiresIn: envConfig.JWT_TTL }),
      this.jwtService.signAsync({ id: user.id, role: user.role }, { expiresIn: envConfig.JWT_REFRESH_TOKEN_TTL }),
    ]);
  }

  setCookie(res: Response, token: string, refreshToken: string) {
    res.cookie('x-auth-cookie', token, {
      httpOnly: true,
      maxAge: envConfig.JWT_TTL,
      secure: envConfig.NODE_ENV !== 'local',
    });
    res.cookie('x-refresh-cookie', refreshToken, {
      httpOnly: true,
      maxAge: envConfig.JWT_REFRESH_TOKEN_TTL,
      secure: envConfig.NODE_ENV !== 'local',
    });
  }
}
