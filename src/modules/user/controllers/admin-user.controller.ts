import { Controller, Post, Body, Res, Req, BadRequestException, ForbiddenException } from '@nestjs/common';
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
    return res.send();
  }

  @Post('refresh')
  async refreshAdmin(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies['x-refresh-cookie'];

    const payload = await this.jwtService.verifyAsync<UserJwtPayload>(refreshToken);
    const user = await this.userService.findOne({ where: { id: payload.id } });

    if (!user) throw new ForbiddenException('Invalid token');
    if (user.role !== payload.role) throw new BadRequestException('Invalid token');

    const [token, generatedRefreshToken] = await this.userService.generateJWTs(payload, user.role);

    res.cookie('x-auth-cookie', token, {
      httpOnly: true,
      maxAge: envConfig.JWT_TTL * 1000,
      secure: true,
      sameSite: 'strict',
    });
    res.cookie('x-refresh-cookie', generatedRefreshToken, {
      httpOnly: true,
      maxAge: envConfig.JWT_REFRESH_TOKEN_TTL * 1000,
      secure: true,
      sameSite: 'strict',
    });
    return res.send();
  }

  @Post('authenticate')
  async authenticate(@Body() authenticateDto: LoginUserDto, @Res() res: Response) {
    const user = await this.userService.findOne({ where: { email: authenticateDto.email, role: UserRoleEnum.ADMIN } });
    if (!user) throw new BadRequestException('Invalid credentials');

    const isAuthenticated = await this.userService.comparePassword(authenticateDto.password, user.password);
    if (!isAuthenticated) throw new BadRequestException('Invalid credentials');

    if (!user.isOtpEnabled) {
      const [token, refreshToken] = await this.userService.generateJWTs(
        {
          id: user.id,
          role: user.role,
        },
        user.role,
      );
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
      return res.send();
    }

    const otp = this.userService.generateOtp();
    await Promise.all([
      this.redisService.set(user.email + '_OTP', otp, 300),
      this.sqsService.sendToQueue({
        QueueUrl: envConfig.EMAIL_SQS_URL,
        MessageBody: JSON.stringify({
          emailTemplateName: 'OTP',
          templateData: {
            fullName: user.name,
            OTPCode: otp,
          },
          emailFrom: '',
          toAddress: user.email,
        }),
      }),
    ]);

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

    const [token, refreshToken] = await this.userService.generateJWTs(
      {
        id: user.id,
        role: user.role,
      },
      user.role,
    );

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
    return res.send();

    return res.send();
  }
}
