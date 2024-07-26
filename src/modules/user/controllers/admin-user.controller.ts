import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
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
  async refreshAdmin(@Body('refreshToken') refreshToken: string) {
    const [token, generatedRefreshToken] = await this.userService.refreshUser(refreshToken, {
      secret: envConfig.ADMIN_JWT_SECRET,
      issuer: envConfig.ADMIN_JWT_ISSUER,
      audience: envConfig.ADMIN_JWT_AUDIENCE,
    });
    return { token, refreshToken: generatedRefreshToken };
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
      return { message: 'OTP sent successfully.' };
    }

    const [token, refreshToken] = await this.userService.generateJWTs({ id, role });
    return { token, refreshToken };
  }

  @Post('validate-otp')
  async validateOtp(@Body() otpDto: ValidateOtpDto) {
    const user = await this.userService.findOne({ where: { email: otpDto.email, role: UserRoleEnum.ADMIN } });
    if (!user) throw new BadRequestException('Invalid credentials');

    const otp = await this.redisService.get(user.email + '_OTP');
    if (!otp || otp != otpDto.otp) throw new BadRequestException('Invalid Otp');

    await this.redisService.delete(user.email + '_OTP');

    const [token, refreshToken] = await this.userService.generateJWTs({ id: user.id, role: user.role });

    return { token, refreshToken };
  }
}
