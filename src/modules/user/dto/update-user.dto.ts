import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { IsBoolean, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export class PasswordChangeDto {
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/, {
    message:
      'Password must have at least 1 uppercase letter, 1 number, 1 special character, and be at least 8 characters long',
  })
  newPassword: string;
}

export class EditProfileDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  image: string;

  @IsOptional()
  @IsString()
  @Matches(/^$|^\d{10}$/, { message: 'Phone number must be empty or exactly 10 digits' })
  phone: string;
}

export class UpdateUserDto extends PartialType(OmitType(CreateUserDto, ['password'])) {
  @IsBoolean()
  @IsOptional()
  isActive: boolean;
}
