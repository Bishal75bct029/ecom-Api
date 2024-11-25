import { OmitType, PickType } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsInt, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

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

export class ForgotPasswordQuery {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class ValidateOtpDto extends ForgotPasswordQuery {
  @IsString()
  @IsNotEmpty()
  otp: string;

  // @IsIn(['login', 'forgotPassword'], { message: "Type must be 'login' or 'forgotPassword'" })
  // @IsNotEmpty()
  // type: 'login' | 'forgotPassword';
}

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
