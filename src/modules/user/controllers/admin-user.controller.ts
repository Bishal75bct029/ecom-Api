import {
  Controller,
  Post,
  Body,
  BadRequestException,
  Query,
  Get,
  GoneException,
  HttpCode,
  ForbiddenException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
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

@ApiTags('Admin User')
@Controller('admin/users')
export class AdminUserController {
  constructor(
    private readonly userService: UserService,
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

  // @Post('logout')
  // async logoutAdmin(@Res() res: Response) {
  //   return res.status(200).send();
  // }

  @Post('refresh')
  @HttpCode(200)
  async refreshAdmin(@Body('refreshToken') refreshToken: string) {
    try {
      const [token, generatedRefreshToken] = await this.userService.refreshUser(refreshToken, {
        secret: envConfig.ADMIN_JWT_SECRET,
        issuer: envConfig.ADMIN_JWT_ISSUER,
        audience: envConfig.ADMIN_JWT_AUDIENCE,
      });
      return { token, refreshToken: generatedRefreshToken };
    } catch (error) {
      throw new ForbiddenException('Session expired. Please re-login.');
    }
  }

  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;
    const user = await this.userService.findOne({ where: { email } });

    if (!user) return true;

    const token = await this.userService.generateJWTs({ email, role: UserRoleEnum.ADMIN });
    const url = envConfig.PASSWORD_RESET_URL + '?token=' + token;
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
      const { email } = await this.userService.verifyJWT(token, UserRoleEnum.ADMIN);
      const redisPasswordResetToken = await this.redisService.get(email + '_PW_RESET_TOKEN');
      if (!redisPasswordResetToken || redisPasswordResetToken !== token) throw new Error();
      return true;
    } catch (error) {
      throw new GoneException('Your link has expired.');
    }
  }

  @Post('reset-password')
  async changePassword(@Body() { token, password }: ChangePasswordDto) {
    const { email } = await this.userService.verifyJWT(token, UserRoleEnum.ADMIN);

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
  async authenticate(@Body() loginUserDto: LoginUserDto) {
    const { email, role, name, isOtpEnabled, id } = await this.userService.login({
      ...loginUserDto,
      role: UserRoleEnum.ADMIN,
    });

    if (isOtpEnabled) {
      try {
        const otp = this.userService.generateOtp();

        await this.redisService.set(email + '_OTP', otp.toString(), 300);
        console.log('redis OK');
        await this.sqsService.sendToQueue({
          QueueUrl: envConfig.EMAIL_SQS_URL,
          MessageBody: JSON.stringify({
            emailTemplateName: 'NepalOTP',
            templateData: {
              fullName: name,
              OTPCode: otp,
            },
            emailFrom: 'Ecommerce<noreply@innovatetech.io>',
            toAddress: email,
          }),
        });
        console.log('SQS email sent');
        // await Promise.all([
        //   this.redisService.set(email + '_OTP', otp.toString(), 300),
        //   this.sqsService.sendToQueue({
        //     QueueUrl: envConfig.EMAIL_SQS_URL,
        //     MessageBody: JSON.stringify({
        //       emailTemplateName: 'NepalOTP',
        //       templateData: {
        //         fullName: name,
        //         OTPCode: otp,
        //       },
        //       emailFrom: 'Ecommerce<noreply@innovatetech.io>',
        //       toAddress: email,
        //     }),
        //   }),
        // ]);
      } catch (error) {
        console.log(error);
        return;
      }

      return { message: 'OTP sent successfully.', isOtpEnabled };
    }

    const [token, refreshToken] = await this.userService.generateJWTs({ id, role });
    return { token, refreshToken };
  }

  @Post('validate-otp')
  async validateLoginOtp(@Body() otpDto: ValidateOtpDto) {
    const user = await this.userService.findOne({ where: { email: otpDto.email, role: UserRoleEnum.ADMIN } });
    if (!user) throw new BadRequestException('Invalid credentials.');

    const otp = await this.redisService.get(user.email + '_OTP');
    if (!otp || otp != otpDto.otp) throw new BadRequestException('The code you entered is incorrect.');

    this.redisService.delete(user.email + '_OTP');
    const [token, refreshToken] = await this.userService.generateJWTs({ id: user.id, role: user.role });

    return { token, refreshToken };
  }

  @Post('resend-otp')
  async resendOtp(@Body() { email }: ResendOtpDto) {
    const user = await this.userService.findOne({ where: { email } });
    if (!user) return true;

    const redisOtp = await this.redisService.get(email + '_OTP');
    if (redisOtp) throw new Error('Cannot resend OTP');

    const otp = this.userService.generateOtp();

    await Promise.all([
      this.redisService.set(email + '_OTP', otp.toString(), 300),
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
}
