import { IsEnum, IsNotEmpty, IsNumber, IsString, Max, Min } from 'class-validator';

export enum FileUploadTypeEnum {
  PRODUCTS = 'products',
  CATEGORIES = 'categories',
  USERS = 'users',
}

export class GetFileUploadSignedTokenDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @Max(1048576 * 2, { message: 'File size should be less than 2MB' })
  size: number;

  @IsEnum(FileUploadTypeEnum)
  @IsNotEmpty()
  uploadFor: FileUploadTypeEnum;
}
