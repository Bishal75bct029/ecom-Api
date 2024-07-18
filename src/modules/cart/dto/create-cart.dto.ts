import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateCartDto {
  @IsUUID()
  @IsOptional()
  id: string;

  @IsUUID('all', { each: true })
  @IsNotEmpty()
  productMetaId: string[];
}
