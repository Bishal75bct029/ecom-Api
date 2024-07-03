import { Controller, Post, Body, Res, Req, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { ApiTags } from '@nestjs/swagger';
import { UserService } from '../services/user.service';
import { CreateAdminUserDto, LoginUserDto, ValidateOtpDto } from '../dto/create-user.dto';
import { UserRoleEnum } from '../entities/user.entity';
import { RedisService } from '@/libs/redis/redis.service';

@ApiTags('Admin User')
@Controller('admin/users')
export class AdminUserController {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private redisService: RedisService,
  ) {}

  @Post('create')
  async createAdmin(@Body() createAdminUserDto: CreateAdminUserDto) {
    createAdminUserDto.password = await bcrypt.hash(createAdminUserDto.password, 10);

    const user = await this.userService.createAndSave({ ...createAdminUserDto, role: UserRoleEnum.ADMIN });
    delete user.password;

    return user;
  }

  @Post('login')
  async loginAdmin(@Body() loginUserDto: LoginUserDto, @Res() res: Response) {
    return this.userService.login(loginUserDto, res, UserRoleEnum.ADMIN);
  }

  @Post('logout')
  async logoutAdmin(@Res() res: Response) {
    return this.userService.logout(res);
  }

  @Post('refresh')
  async refreshAdmin(@Req() req: Request, @Res() res: Response) {
    return this.userService.refresh(req, res, UserRoleEnum.ADMIN);
  }

  @Post('authenticate')
  async authenticate(@Body() authenticateDto: LoginUserDto, @Res() res: Response) {
    const user = await this.userService.findOne({ where: { email: authenticateDto.email, role: UserRoleEnum.ADMIN } });
    if (!user) throw new BadRequestException('Invalid credentials');

    const isAuthenticated = await this.userService.comparePassword(authenticateDto.password, user.password);
    if (!isAuthenticated) throw new BadRequestException('Invalid credentials');

    if (!user.isOtpEnabled) {
      const tokens = await this.userService.generateJWTs(
        {
          id: user.id,
          role: user.role,
        },
        user.role,
      );
      this.userService.setCookie(res, ...tokens);
      return res.send();
    }

    const otp = this.userService.generateOtp();
    await this.redisService.set(user.email + '_OTP', otp, 300);

    return res.send({
      message: 'OTP sent successfully.',
    });
  }

  @Post('validate-otp')
  async validateOtp(@Body() otpDto: ValidateOtpDto, @Res() res: Response) {
    const user = await this.userService.findOne({ where: { email: otpDto.email, role: UserRoleEnum.ADMIN } });
    if (!user) throw new BadRequestException('Invalid credentials');

    const otp = await this.redisService.get(user.email + '_OTP');
    if (!otp || otp != otpDto.otp) throw new BadRequestException('Invalid Otp');

    await this.redisService.delete(user.email + '_OTP');

    const tokens = await this.userService.generateJWTs(
      {
        id: user.id,
        role: user.role,
      },
      user.role,
    );
    this.userService.setCookie(res, ...tokens);

    return res.send();
  }
}
