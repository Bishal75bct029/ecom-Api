import { PickType } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateUserDto {}
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

export class LoginUserDto extends PickType(CreateAdminUserDto, ['email', 'password']) {
  @IsOptional()
  @IsString()
  role: string;
}

export class ValidateOtpDto extends PickType(CreateAdminUserDto, ['email']) {
  @IsString()
  otp: string;
}
