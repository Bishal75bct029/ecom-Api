import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { AbstractService } from '@/libs/service/abstract.service';
import { UserEntity } from '../entities';
import { envConfig } from '@/configs/envConfig';
import { RedisService } from '@/libs/redis/redis.service';

@Injectable()
export class UserService extends AbstractService<UserEntity> {
  constructor(
    @InjectRepository(UserEntity) private readonly itemRepository: Repository<UserEntity>,
    private readonly jwtService: JwtService,
    private redisService: RedisService,
  ) {
    super(itemRepository);
  }

  async comparePassword(password: string, hashPassword: string) {
    return bcrypt.compare(password, hashPassword);
  }

  // logout(res: Response) {
  //   res.clearCookie('x-auth-cookie');
  //   res.clearCookie('x-refresh-cookie');
  //   return res.send();
  // }

  generateOtp() {
    return Math.floor(Math.random() * 1000000);
  }

  async generateJWTs(payload: UserJwtPayload, role: UserRole) {
    const options = {
      secret: role === 'ADMIN' ? envConfig.ADMIN_JWT_SECRET : envConfig.API_JWT_SECRET,
      issuer: role === 'ADMIN' ? envConfig.ADMIN_JWT_ISSUER : envConfig.API_JWT_ISSUER,
      audience: role === 'ADMIN' ? envConfig.ADMIN_JWT_AUDIENCE : envConfig.API_JWT_AUDIENCE,
    };
    return Promise.all([
      this.jwtService.signAsync(payload, { ...options, expiresIn: envConfig.JWT_TTL }),
      this.jwtService.signAsync(payload, { ...options, expiresIn: envConfig.JWT_REFRESH_TOKEN_TTL }),
    ]);
  }
}
