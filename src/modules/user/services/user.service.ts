import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AbstractService } from '@/libs/service/abstract.service';
import { UserEntity, UserRoleEnum } from '../entities';
import { envConfig } from '@/configs/envConfig';
import { LoginUserDto } from '../dto';
import { PasetoJwtService } from '@/libs/pasetoJwt/pasetoJwt.service';
import { ConsumeOptions } from 'paseto';

@Injectable()
export class UserService extends AbstractService<UserEntity> {
  constructor(
    @InjectRepository(UserEntity) private readonly itemRepository: Repository<UserEntity>,
    private readonly jwtService: PasetoJwtService,
  ) {
    super(itemRepository);
  }

  async generateJWTs(payload: UserJwtPayload) {
    const options = {
      secret: payload.role === 'ADMIN' ? envConfig.ADMIN_JWT_SECRET : envConfig.API_JWT_SECRET,
      issuer: payload.role === 'ADMIN' ? envConfig.ADMIN_JWT_ISSUER : envConfig.API_JWT_ISSUER,
      audience: payload.role === 'ADMIN' ? envConfig.ADMIN_JWT_AUDIENCE : envConfig.API_JWT_AUDIENCE,
    };
    return Promise.all([
      this.jwtService.pasetoSign(payload, { ...options, expiresIn: '10s' }),
      this.jwtService.pasetoSign(payload, { ...options, expiresIn: envConfig.JWT_REFRESH_TOKEN_TTL }),
    ]);
  }

  async verifyJWT(token: string, role: UserRoleEnum) {
    return this.jwtService.pasetoVerify<UserJwtPayload>(token, {
      secret: role === 'ADMIN' ? envConfig.ADMIN_JWT_SECRET : envConfig.API_JWT_SECRET,
      issuer: role === 'ADMIN' ? envConfig.ADMIN_JWT_ISSUER : envConfig.API_JWT_ISSUER,
      audience: role === 'ADMIN' ? envConfig.ADMIN_JWT_AUDIENCE : envConfig.API_JWT_AUDIENCE,
    });
  }

  async login(loginUserDto: LoginUserDto) {
    const user = await this.findOne({ where: { email: loginUserDto.email } });

    if (!user) throw new BadRequestException('Invalid Credentials');
    if (user.role !== loginUserDto.role) throw new BadRequestException('Invalid Credentials');
    if (!(await this.comparePassword(loginUserDto.password, user.password)))
      throw new BadRequestException('Invalid Credentials');

    return user;
  }

  async comparePassword(password: string, hashPassword: string) {
    return bcrypt.compare(password, hashPassword);
  }

  generateOtp() {
    const minm = 100000;
    const maxm = 999999;
    return Math.floor(Math.random() * (maxm - minm + 1)) + minm;
  }

  async refreshUser(refreshToken: string, options: ConsumeOptions<false> & { secret?: string }) {
    if (!refreshToken) throw new ForbiddenException('Invalid token');

    const { id, role, schoolId = '' } = await this.jwtService.pasetoVerify<UserJwtPayload>(refreshToken, options);

    const payload = { id, role, schoolId };
    const user = await this.findOne({ where: { id: payload.id, role: payload.role as UserRoleEnum } });

    if (!user) throw new ForbiddenException('Invalid token');

    const [newToken] = await this.generateJWTs(payload);
    return [newToken, refreshToken];
  }
}
