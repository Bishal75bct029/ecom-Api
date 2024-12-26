import {
  Controller,
  Post,
  Body,
  BadRequestException,
  Query,
  Get,
  GoneException,
  Req,
  Res,
  InternalServerErrorException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { UserService } from '../services/user.service';
import {
  ChangePasswordDto,
  CreateAdminUserDto,
  ForgotPasswordDto,
  LoginUserDto,
  ResendOtpDto,
  ValidateOtpDto,
  ValidatePasswordResetTokenQuery,
} from '../dto/create-user.dto';
import { UserRoleEnum } from '../entities/user.entity';
import { RedisService } from '@/libs/redis/redis.service';
import { envConfig } from '@/configs/envConfig';
import { SQSService } from '@/common/module/aws/sqs.service';
import { PasetoJwtService } from '@/libs/pasetoJwt/pasetoJwt.service';
import { SESSION_COOKIE_NAME } from '@/app.constants';

@ApiTags('Admin User')
@Controller('admin/users')
export class AdminUserController {
  constructor(
    private readonly userService: UserService,
    private readonly redisService: RedisService,
    private readonly sqsService: SQSService,
    private readonly jwtService: PasetoJwtService,
  ) {}

  @Post('create')
  async createAdmin(@Body() createAdminUserDto: CreateAdminUserDto) {
    createAdminUserDto.password = await bcrypt.hash(createAdminUserDto.password, 10);

    if (await this.userService.findOne({ where: { email: createAdminUserDto.email } })) {
      throw new BadRequestException('User already exist');
    }

    const user = await this.userService.createAndSave({ ...createAdminUserDto, role: UserRoleEnum.ADMIN });
    delete user.password;

    return user;
  }

  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto, @Req() req: Request) {
    const { email } = forgotPasswordDto;
    const user = await this.userService.findOne({ where: { email } });

    if (!user) return true;

    const token = await this.jwtService.pasetoSign(
      { email, role: UserRoleEnum.ADMIN },
      { expiresIn: '5m', secret: envConfig.PASETO_JWT_SECRET },
    );
    const url = req.headers.origin + '/reset-password?token=' + token;
    await Promise.all([
      this.redisService.set(email + '_PW_RESET_TOKEN', token, 300),
      this.sqsService.sendToQueue({
        QueueUrl: envConfig.EMAIL_SQS_URL,
        MessageBody: JSON.stringify({
          emailTemplateName: 'General',
          templateData: {
            subject: 'Forgot Password Request',
            fullName: user.name,
            message: `
           Forgot your password?
           We received a request to reset your password.
           To reset your password copy and paste the link below or click it. This link will be valid for 5 minutes.
           ${url}`,
          },
          emailFrom: 'Ecommerce<noreply@innovatetech.io>',
          toAddress: email,
        }),
      }),
    ]);

    return true;
  }

  @Get('validate-password-link')
  async validateOtp(@Query() { token }: ValidatePasswordResetTokenQuery) {
    try {
      const { email } = await this.jwtService.pasetoVerify<UserJwtPayload>(token, {
        secret: envConfig.PASETO_JWT_SECRET,
      });
      const redisPasswordResetToken = await this.redisService.get(email + '_PW_RESET_TOKEN');
      if (!redisPasswordResetToken || redisPasswordResetToken !== token) throw new Error();
      return true;
    } catch (error) {
      throw new GoneException('Your link has expired.');
    }
  }

  @Post('reset-password')
  async changePassword(@Body() { token, password }: ChangePasswordDto) {
    const { email } = await this.jwtService.pasetoVerify<UserJwtPayload>(token, {
      secret: envConfig.PASETO_JWT_SECRET,
    });
    const user = await this.userService.findOne({ where: { email } });
    if (!user) throw new GoneException('Your link has expired.');

    const redisPasswordResetToken = await this.redisService.get(email + '_PW_RESET_TOKEN');
    if (!redisPasswordResetToken || redisPasswordResetToken !== token)
      throw new GoneException('Your link has expired.');

    const isOldPassword = await bcrypt.compare(password, user.password);

    if (isOldPassword) {
      throw new BadRequestException("You can't use your old password.");
    }
    await Promise.all([
      this.userService.update({ id: user.id }, { password: await bcrypt.hash(password, 10) }),
      this.redisService.delete(email + '_PW_RESET_TOKEN'),
    ]);
    return { message: 'Password changed successfully' };
  }

  @Post('authenticate')
  async authenticate(@Body() loginUserDto: LoginUserDto, @Req() req: Request, @Res() res: Response) {
    const user = await this.userService.findOne({
      where: { email: loginUserDto.email, role: UserRoleEnum.ADMIN },
      select: ['id', 'name', 'image', 'role', 'email', 'schoolId', 'isOtpEnabled', 'password'],
    });
    if (!user) throw new BadRequestException('The email address or password you entered is incorrect.');

    if (!this.userService.comparePassword(loginUserDto.password, user.password))
      throw new BadRequestException('The email address or password you entered is incorrect.');

    if (user.isOtpEnabled) {
      const otp = this.userService.generateOtp();
      await Promise.all([
        this.redisService.set(user.email + '_OTP', otp.toString(), 60 * 5),
        this.sqsService.sendToQueue({
          QueueUrl: envConfig.EMAIL_SQS_URL,
          MessageBody: JSON.stringify({
            emailTemplateName: 'NepalOTP',
            templateData: {
              fullName: user.name,
              OTPCode: otp,
            },
            emailFrom: 'Ecommerce<noreply@innovatetech.io>',
            toAddress: user.email,
          }),
        }),
      ]);
      return { message: 'OTP sent successfully.', isOtpEnabled: true };
    }
    delete user.password;
    req.session.user = user;
    res.cookie('custom-cookue', 'custom-value', {
      httpOnly: true,
      path: '/',
      secure: true,
      maxAge: 86400 * 1000,
      sameSite: 'none',
    });
    // return { message: 'Logged in successfully.' };
    return res.status(200).send({});
  }

  @Post('validate-otp')
  async validateLoginOtp(@Body() otpDto: ValidateOtpDto, @Req() req: Request) {
    const user = await this.userService.findOne({
      where: { email: otpDto.email, role: UserRoleEnum.ADMIN },
      select: ['id', 'name', 'image', 'role', 'email', 'schoolId', 'isOtpEnabled'],
    });
    if (!user) throw new BadRequestException('Invalid credentials.');

    const otp = await this.redisService.get(user.email + '_OTP');
    if (!otp || otp != otpDto.otp) throw new BadRequestException('The code you entered is incorrect.');

    await this.redisService.delete(user.email + '_OTP');
    delete user.password;
    req.session.user = user;
    return { message: 'Logged in successfully.' };
  }

  @Post('resend-otp')
  async resendOtp(@Body() { email }: ResendOtpDto) {
    const user = await this.userService.findOne({ where: { email } });
    if (!user) throw new BadRequestException('Cannot resend OTP.');

    const redisOtp = await this.redisService.get(email + '_OTP');
    if (redisOtp) throw new BadRequestException('Cannot resend OTP.');

    const otp = this.userService.generateOtp();

    await Promise.all([
      this.redisService.set(email + '_OTP', otp.toString(), 60),
      this.sqsService.sendToQueue({
        QueueUrl: envConfig.EMAIL_SQS_URL,
        MessageBody: JSON.stringify({
          emailTemplateName: 'NepalOTP',
          templateData: {
            fullName: user.name,
            OTPCode: otp,
          },
          emailFrom: 'Ecommerce<noreply@innovatetech.io>',
          toAddress: email,
        }),
      }),
    ]);

    return true;
  }

  @Get('whoami')
  async whoami(@Req() { session }: Request) {
    return { user: session?.user };
  }

  @Get('logout')
  logout(@Req() req: Request, @Res() res: Response) {
    req.session.destroy((err) => {
      if (err) {
        throw new InternalServerErrorException('Logout failed.');
      }
    });
    res.clearCookie(SESSION_COOKIE_NAME);
    res.send({ message: 'Logged out successfully.' });
  }
}
