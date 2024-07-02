import { OmitType } from '@nestjs/mapped-types';
import { IsBoolean, IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

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

export class LoginUserDto extends OmitType(CreateAdminUserDto, ['name']) {}
