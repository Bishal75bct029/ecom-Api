import { OmitType, PickType } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString, Matches, MinLength } from 'class-validator';

export class CreateAdminUserDto {
  @IsNotEmpty()
  @IsEmail()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsBoolean()
  @IsNotEmpty()
  isOtpEnabled: boolean;
}

export class CreateUserDto extends OmitType(CreateAdminUserDto, ['isOtpEnabled']) {}

export class LoginUserDto extends PickType(CreateAdminUserDto, ['email', 'password']) {
  @IsOptional()
  @IsString()
  role: string;
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
      'Password must have at least one uppercase letter, one number, one special character, and be at least 8 characters long',
  })
  password: string;
}
