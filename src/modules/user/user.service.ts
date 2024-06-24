import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request, Response } from 'express';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { AbstractService } from '@/libs/service/abstract.service';
import { UserEntity } from './entities/user.entity';
import { envConfig } from '@/configs/envConfig';
import { LoginUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService extends AbstractService<UserEntity> {
  constructor(
    @InjectRepository(UserEntity) private readonly itemRepository: Repository<UserEntity>,
    private readonly jwtService: JwtService,
  ) {
    super(itemRepository);
  }

  async login(loginUserDto: LoginUserDto, res: Response, role: string) {
    const user = await this.findOne({ where: { email: loginUserDto.email } });

    if (!user) throw new BadRequestException('Invalid Credentials');

    if (user.role !== role) throw new BadRequestException('Invalid Credentials');

    if (!(await bcrypt.compare(loginUserDto.password, user.password)))
      throw new BadRequestException('Invalid Credentials');

    const payload = { id: user.id, role: user.role };

    const [token, refreshToken] = await this.generateJWTs(payload, user.role);

    this.setCookie(res, token, refreshToken);
    return res.send();
  }

  logout(res: Response) {
    res.clearCookie('x-auth-cookie');
    res.clearCookie('x-refresh-cookie');
    return res.send();
  }

  async refresh(req: Request, res: Response, role: string) {
    try {
      const refreshToken = req.cookies['x-refresh-cookie'];

      const payload = await this.jwtService.verifyAsync<UserJwtPayload>(refreshToken);

      const user = await this.findOne({ where: { id: payload.id } });

      if (!user) throw new ForbiddenException('Invalid token');

      if (user.role !== role) throw new BadRequestException('Invalid token');

      const [token, generatedRefreshToken] = await this.generateJWTs(payload, user.role);
      this.setCookie(res, token, generatedRefreshToken);
      return res.send();
    } catch (error) {
      throw new ForbiddenException('Refresh token expired.');
    }
  }

  private async generateJWTs(payload: UserJwtPayload, role: UserRole) {
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

  private setCookie(res: Response, token: string, refreshToken: string) {
    res.cookie('x-auth-cookie', token, {
      httpOnly: true,
      maxAge: envConfig.JWT_TTL * 1000,
      secure: true,
      sameSite: 'strict',
    });
    res.cookie('x-refresh-cookie', refreshToken, {
      httpOnly: true,
      maxAge: envConfig.JWT_REFRESH_TOKEN_TTL * 1000,
      secure: true,
      sameSite: 'strict',
    });
  }
}
