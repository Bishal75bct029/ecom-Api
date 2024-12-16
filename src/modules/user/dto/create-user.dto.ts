import { ApiHideProperty, OmitType, PickType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsAlphanumeric, IsEmail, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export class CreateAdminUserDto {
  @IsNotEmpty()
  @IsEmail()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  @IsAlphanumeric()
  @Transform(({ value }) => value.trim())
  name: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/, {
    message:
      'Password must have at least 1 uppercase letter, 1 number, 1 special character, and be at least 8 characters long',
  })
  password: string;

  @IsNotEmpty()
  @Transform(({ value }) => {
    if (![true, false, 'true', 'false'].includes(value)) {
      throw new Error('Invalid value for isOtpEnabled.');
    }
    return value === 'true' || value === true;
  })
  isOtpEnabled: any;
}

export class CreateUserDto extends OmitType(CreateAdminUserDto, ['isOtpEnabled']) {}

export class LoginUserDto extends PickType(CreateAdminUserDto, ['email']) {
  @IsOptional()
  @IsString()
  @ApiHideProperty()
  role: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class ForgotPasswordDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class ValidateOtpDto extends ForgotPasswordDto {
  @IsString()
  @IsNotEmpty()
  otp: string;
}

export class ValidatePasswordResetTokenQuery {
  @IsString()
  token: string;
}

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/, {
    message:
      'Password must have at least 1 uppercase letter, 1 number, 1 special character, and be at least 8 characters long',
  })
  password: string;
}

export class ResendOtpDto extends ForgotPasswordDto {}
