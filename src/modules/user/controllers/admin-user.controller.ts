import { Controller, Post, Body, Res, Req, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { ApiTags } from '@nestjs/swagger';
import { UserService } from '../services/user.service';
import { CreateAdminUserDto, LoginUserDto, ValidateOtpDto } from '../dto/create-user.dto';
import { UserRoleEnum } from '../entities/user.entity';
import { RedisService } from '@/libs/redis/redis.service';
import { envConfig } from '@/configs/envConfig';
import { SQSService } from '@/common/module/aws/sqs.service';

@ApiTags('Admin User')
@Controller('admin/users')
export class AdminUserController {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private redisService: RedisService,
    private sqsService: SQSService,
  ) {}

  @Post('create')
  async createAdmin(@Body() createAdminUserDto: CreateAdminUserDto) {
    createAdminUserDto.password = await bcrypt.hash(createAdminUserDto.password, 10);
    const user = await this.userService.createAndSave({ ...createAdminUserDto, role: UserRoleEnum.ADMIN });
    delete user.password;

    return user;
  }

  @Post('logout')
  async logoutAdmin(@Res() res: Response) {
    res.clearCookie('x-auth-cookie');
    res.clearCookie('x-refresh-cookie');
    return res.status(200).send();
  }

  @Post('refresh')
  async refreshAdmin(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies['x-refresh-cookie'];
    const [token, generatedRefreshToken] = await this.userService.refreshUser(refreshToken, {
      secret: envConfig.ADMIN_JWT_SECRET,
      issuer: envConfig.ADMIN_JWT_ISSUER,
      audience: envConfig.ADMIN_JWT_AUDIENCE,
    });

    res.cookie('x-auth-cookie', token, {
      httpOnly: true,
      maxAge: envConfig.JWT_REFRESH_TOKEN_TTL * 1000,
      secure: true,
      sameSite: 'strict',
    });
    res.cookie('x-refresh-cookie', generatedRefreshToken, {
      httpOnly: true,
      maxAge: envConfig.JWT_REFRESH_TOKEN_TTL * 1000,
      secure: true,
      sameSite: 'strict',
    });

    return res.status(200).send();
  }

  @Post('authenticate')
  async authenticate(@Body() loginUserDto: LoginUserDto, @Res() res: Response) {
    const { email, role, name, isOtpEnabled, id } = await this.userService.login({
      ...loginUserDto,
      role: UserRoleEnum.ADMIN,
    });

    if (isOtpEnabled) {
      const otp = this.userService.generateOtp();

      await Promise.all([
        this.redisService.set(email + '_OTP', otp, 300),
        this.sqsService.sendToQueue({
          QueueUrl: envConfig.EMAIL_SQS_URL,
          MessageBody: JSON.stringify({
            emailTemplateName: 'OTP',
            templateData: {
              fullName: name,
              OTPCode: otp,
            },
            emailFrom: '',
            toAddress: email,
          }),
        }),
      ]);
      return res.send({
        message: 'OTP sent successfully.',
      });
    }

    const [token, refreshToken] = await this.userService.generateJWTs({ id, role });
    res.cookie('x-auth-cookie', token, {
      httpOnly: true,
      maxAge: envConfig.JWT_REFRESH_TOKEN_TTL * 1000,
      secure: true,
      sameSite: 'strict',
    });
    res.cookie('x-refresh-cookie', refreshToken, {
      httpOnly: true,
      maxAge: envConfig.JWT_REFRESH_TOKEN_TTL * 1000,
      secure: true,
      sameSite: 'strict',
    });

    return res.status(200).send();
  }

  @Post('validate-otp')
  async validateOtp(@Body() otpDto: ValidateOtpDto, @Res() res: Response) {
    const user = await this.userService.findOne({ where: { email: otpDto.email, role: UserRoleEnum.ADMIN } });
    if (!user) throw new BadRequestException('Invalid credentials');

    const otp = await this.redisService.get(user.email + '_OTP');
    if (!otp || otp != otpDto.otp) throw new BadRequestException('Invalid Otp');

    await this.redisService.delete(user.email + '_OTP');

    const [token, refreshToken] = await this.userService.generateJWTs({ id: user.id, role: user.role });

    res.cookie('x-auth-cookie', token, {
      httpOnly: true,
      maxAge: envConfig.JWT_REFRESH_TOKEN_TTL * 1000,
      secure: true,
      sameSite: 'strict',
    });
    res.cookie('x-refresh-cookie', refreshToken, {
      httpOnly: true,
      maxAge: envConfig.JWT_REFRESH_TOKEN_TTL * 1000,
      secure: true,
      sameSite: 'strict',
    });

    return res.status(200).send();
  }
}
