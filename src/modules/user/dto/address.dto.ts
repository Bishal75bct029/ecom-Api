import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { AddressTypeEnum } from '../entities/address.entity';

export class CreateAddressDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  contact: string;

  @IsEnum(AddressTypeEnum)
  @IsNotEmpty()
  type: AddressTypeEnum;
}
