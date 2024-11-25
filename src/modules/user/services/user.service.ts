import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService, JwtVerifyOptions } from '@nestjs/jwt';
import { AbstractService } from '@/libs/service/abstract.service';
import { UserEntity, UserRoleEnum } from '../entities';
import { envConfig } from '@/configs/envConfig';
import { LoginUserDto } from '../dto';
import { UserJwtPayload } from '@/@types';

@Injectable()
export class UserService extends AbstractService<UserEntity> {
  constructor(
    @InjectRepository(UserEntity) private readonly itemRepository: Repository<UserEntity>,
    private readonly jwtService: JwtService,
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
      await this.jwtService.signAsync(payload, { ...options, expiresIn: envConfig.JWT_TTL }),
      await this.jwtService.signAsync(payload, { ...options, expiresIn: envConfig.JWT_REFRESH_TOKEN_TTL }),
    ]);
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
    return Math.floor(Math.random() * 1000000).toString();
  }

  async refreshUser(refreshToken: string, options: JwtVerifyOptions) {
    if (!refreshToken) throw new ForbiddenException('Invalid token');

    const { id, role, schoolId = '' } = await this.jwtService.verifyAsync<UserJwtPayload>(refreshToken, options);

    const payload = { id, role, schoolId };
    const user = await this.findOne({ where: { id: payload.id, role: payload.role as UserRoleEnum } });

    if (!user) throw new ForbiddenException('Invalid token');

    return this.generateJWTs(payload);
  }
}
