import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateCartDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsUUID('all', { each: true })
  @IsNotEmpty()
  productMetaId: string[];
}
