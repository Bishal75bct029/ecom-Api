import { Controller, Post, Body, BadRequestException, NotFoundException, Query } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { ApiTags } from '@nestjs/swagger';
import { UserService } from '../services/user.service';
import {
  ChangePasswordDto,
  CreateAdminUserDto,
  ForgotPasswordDto,
  LoginUserDto,
  ValidateOtpDto,
  ValidatePasswordResetTokenQuery,
} from '../dto/create-user.dto';
import { UserRoleEnum } from '../entities/user.entity';
import { RedisService } from '@/libs/redis/redis.service';
import { envConfig } from '@/configs/envConfig';
import { SQSService } from '@/common/module/aws/sqs.service';
import { JwtService } from '@nestjs/jwt';

@ApiTags('Admin User')
@Controller('admin/users')
export class AdminUserController {
  constructor(
    private readonly userService: UserService,
    private redisService: RedisService,
    private sqsService: SQSService,
    private jwtService: JwtService,
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
  async refreshAdmin(@Body('refreshToken') refreshToken: string) {
    const [token, generatedRefreshToken] = await this.userService.refreshUser(refreshToken, {
      secret: envConfig.ADMIN_JWT_SECRET,
      issuer: envConfig.ADMIN_JWT_ISSUER,
      audience: envConfig.ADMIN_JWT_AUDIENCE,
    });
    return { token, refreshToken: generatedRefreshToken };
  }

  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;
    const user = await this.userService.findOne({ where: { email } });

    if (!user) throw new NotFoundException('User not found');

    const [token, _] = await this.userService.generateJWTs({ email, role: UserRoleEnum.ADMIN });
    const url = envConfig.PASSWORD_RESET_DOMAIN + '/reset-password?token=' + token;

    await Promise.all([
      this.redisService.set(email + '_PW_RESET_LINK', token, 300),
      // this.sqsService.sendToQueue({
      //   QueueUrl: envConfig.EMAIL_SQS_URL,
      //   MessageBody: JSON.stringify({
      //     emailTemplateName: 'OTP',
      //     templateData: {
      //       fullName: user.name,
      //       OTPCode: otp,
      //     },
      //     emailFrom: '',
      //     toAddress: email,
      //   }),
      // }),
    ]);

    return { message: 'Password reset link sent successfully.', url };
  }

  @Post('validate-password-link')
  async validateOtp(@Query() { token }: ValidatePasswordResetTokenQuery) {
    const { email } = await this.userService.verifyJWT(token, UserRoleEnum.ADMIN);
    const redisPasswordResetLink = await this.redisService.get(email + '_PW_RESET_LINK');
    if (!redisPasswordResetLink || redisPasswordResetLink !== token) throw new BadRequestException('Invalid Link');

    return true;
  }

  @Post('reset-password')
  async changePassword(@Body() { token, password }: ChangePasswordDto) {
    const { email } = await this.userService.verifyJWT(token, UserRoleEnum.ADMIN);
    const user = await this.userService.findOne({ where: { email } });
    if (!user) throw new NotFoundException('User not found');

    const redisPasswordResetLink = await this.redisService.get(email + '_PW_RESET_LINK');
    console.log(token, 'get \n', redisPasswordResetLink, 'token is here');
    if (!redisPasswordResetLink || redisPasswordResetLink !== token) throw new BadRequestException('Invalid Link');

    await this.userService.update({ id: user.id }, { password: await bcrypt.hash(password, 10) });
    this.redisService.delete(email + '_PW_RESET_LINK');

    return { message: 'Password changed successfully' };
  }

  @Post('authenticate')
  async authenticate(@Body() loginUserDto: LoginUserDto) {
    const { email, role, name, isOtpEnabled, id } = await this.userService.login({
      ...loginUserDto,
      role: UserRoleEnum.ADMIN,
    });

    if (isOtpEnabled) {
      const otp = this.userService.generateOtp();

      await Promise.all([
        this.redisService.set(email + '_OTP', otp.toString(), 300),
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

      return { message: 'OTP sent successfully.', isOtpEnabled };
    }

    const [token, refreshToken] = await this.userService.generateJWTs({ id, role });
    return { token, refreshToken };
  }

  @Post('validate-otp')
  async validateLoginOtp(@Body() otpDto: ValidateOtpDto) {
    const user = await this.userService.findOne({ where: { email: otpDto.email, role: UserRoleEnum.ADMIN } });
    if (!user) throw new BadRequestException('Invalid credentials');

    const otp = await this.redisService.get(user.email + '_OTP');
    if (!otp || otp != otpDto.otp) throw new BadRequestException('Invalid Otp');

    this.redisService.delete(user.email + '_OTP');

    const [token, refreshToken] = await this.userService.generateJWTs({ id: user.id, role: user.role });

    return { token, refreshToken };
  }
}
