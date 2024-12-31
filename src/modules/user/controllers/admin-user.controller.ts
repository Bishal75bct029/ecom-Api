import { SESSION_COOKIE_NAME } from '@/app.constants';
import { STATUS_ENUM, ValidateIDDto } from '@/common/dtos';
import { SQSService } from '@/common/module/aws/sqs.service';
import { getPaginatedResponse } from '@/common/utils';
import { envConfig } from '@/configs/envConfig';
import { PasetoJwtService } from '@/libs/pasetoJwt/pasetoJwt.service';
import { RedisService } from '@/libs/redis/redis.service';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  GoneException,
  InternalServerErrorException,
  Param,
  Post,
  Put,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import * as bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import { ILike } from 'typeorm';
import { EditProfileDto, PasswordChangeDto, UpdateUserDto } from '../dto';
import {
  CreateAdminUserDto,
  ForgotPasswordDto,
  LoginUserDto,
  ResendOtpDto,
  ResetPasswordDto,
  ValidateOtpDto,
  ValidatePasswordResetTokenQuery,
} from '../dto/create-user.dto';
import { GetUserListQueryDto } from '../dto/get-user.dto';
import { UserRoleEnum } from '../entities/user.entity';
import { UserService } from '../services/user.service';

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
  async resetPassword(@Body() { token, password }: ResetPasswordDto) {
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

    return { message: 'Password reset successfully' };
  }

  @Post('authenticate')
  async authenticate(@Body() loginUserDto: LoginUserDto, @Req() req: Request) {
    const user = await this.userService.findOne({
      where: { email: loginUserDto.email, role: UserRoleEnum.ADMIN },
      select: ['id', 'name', 'image', 'role', 'email', 'schoolId', 'isOtpEnabled', 'password', 'phone'],
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
    await this.userService.update({ id: user.id }, { lastLogInDate: new Date() });

    return { message: 'Logged in successfully.' };
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

  @Get()
  async getUsersList(@Query() query: GetUserListQueryDto) {
    const { page = 1, limit = 10, search, status } = query;

    const [users, count] = await this.userService.findAndCount({
      select: ['id', 'name', 'email', 'image', 'isActive', 'lastLogInDate'],
      skip: (page - 1) * limit,
      take: limit,
      where: [
        {
          name: search ? ILike(`%${search}%`) : undefined,
          isActive: !status ? undefined : status.toLowerCase() === STATUS_ENUM.ACTIVE.toLowerCase(),
        },
        {
          email: search ? ILike(`%${search}%`) : undefined,
          isActive: !status ? undefined : status.toLowerCase() === STATUS_ENUM.ACTIVE.toLowerCase(),
        },
      ],
      order: { updatedAt: 'DESC' },
    });

    return { items: users, ...getPaginatedResponse({ count, limit, page }) };
  }

  @Put('edit-profile')
  async editProfile(@Req() req: Request, @Body() editProfileDto: EditProfileDto) {
    const { phone, image, name } = editProfileDto;
    await this.userService.update({ id: req.session.user.id }, { ...editProfileDto });
    req.session.user = {
      ...req.session.user,
      phone,
      image,
      name,
    };

    return { message: 'Profile updated successfully' };
  }

  @Put('change-password')
  async changePassword(@Req() { session: { user } }: Request, @Body() passwordChangeDto: PasswordChangeDto) {
    const { currentPassword, newPassword } = passwordChangeDto;
    const userDetail = await this.userService.findOne({ where: { id: user.id }, select: ['id', 'password'] });

    if (!this.userService.comparePassword(currentPassword, userDetail.password)) {
      throw new BadRequestException('Invalid current password');
    }
    await this.userService.update({ id: user.id }, { password: await bcrypt.hash(newPassword, 10) });

    return { message: 'Password change successfully' };
  }

  @Put(':id')
  async updateUser(@Param() { id }: ValidateIDDto, @Body() updateUserDto: UpdateUserDto) {
    const userDetail = await this.userService.findOne({ where: { id } });

    if (!userDetail) throw new BadRequestException('User not found');

    if (!!updateUserDto?.email && userDetail?.email !== updateUserDto?.email) {
      if (await this.userService.findOne({ where: { email: updateUserDto?.email } })) {
        throw new BadRequestException('Email already in use');
      }
    }

    await this.userService.update({ id: userDetail.id }, { ...updateUserDto });
    return { message: 'Profile updated successfully' };
  }

  @Delete(':id')
  async deleteUser(@Req() { session: { user: reqUserDetail } }: Request, @Param() { id }: ValidateIDDto) {
    if (id === reqUserDetail.id) throw new BadRequestException('Cannot delete logged in user.');

    const userDetail = await this.userService.findOne({ where: { id } });

    if (!userDetail) throw new BadRequestException('User not found');

    await this.userService.softDelete(userDetail.id);
    return;
  }
}
