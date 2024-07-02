import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class AuthUserDto {
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class ValidateUserDto extends AuthUserDto {
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class ValidateOtpDto extends AuthUserDto {
  @IsString()
  otp: string;
}
