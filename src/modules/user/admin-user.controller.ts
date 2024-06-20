import { Controller, Post, Body, BadRequestException, Res, Req, ForbiddenException } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateAdminUserDto, LoginAdminUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { UserRoleEnum } from './entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import { JwtPayload } from '@/common/middlewares/admin/admin.middleware';

@Controller('admin/users')
export class AdminUserController {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('create')
  async createAdmin(@Body() createAdminUserDto: CreateAdminUserDto) {
    createAdminUserDto.password = await bcrypt.hash(createAdminUserDto.password, 10);

    const user = await this.userService.createAndSave({ ...createAdminUserDto, role: UserRoleEnum.ADMIN });
    delete user.password;

    return user;
  }

  @Post('login')
  async loginAdmin(@Body() loginAdminUserDto: LoginAdminUserDto, @Res() res: Response) {
    const user = await this.userService.findOne({ where: { email: loginAdminUserDto.email } });

    if (!user) throw new BadRequestException('Invalid Credentials');

    if (!(await bcrypt.compare(loginAdminUserDto.password, user.password)))
      throw new BadRequestException('Invalid Credentials');

    const [token, refreshToken] = await this.userService.generateAuthTokens(user);
    this.userService.setCookie(res, token, refreshToken);
    return res.send();
  }

  @Post('logout')
  async logoutAdmin(@Res() res: Response) {
    res.clearCookie('x-auth-cookie');
    res.clearCookie('x-refresh-cookie');
    return res.send();
  }

  @Post('refresh')
  async refreshAdmin(@Req() req: Request, @Res() res: Response) {
    try {
      const refreshToken = req.cookies['x-refresh-cookie'];

      const payload = await this.jwtService.verifyAsync<JwtPayload>(refreshToken);

      const user = await this.userService.findOne({ where: { id: payload.id } });

      if (!user) throw new ForbiddenException('Invalid Credentials');

      const [token, generatedRefreshToken] = await this.userService.generateAuthTokens(user);
      this.userService.setCookie(res, token, generatedRefreshToken);
      return res.send();
    } catch (error) {
      throw new ForbiddenException('Refresh token expired.');
    }
  }
}
