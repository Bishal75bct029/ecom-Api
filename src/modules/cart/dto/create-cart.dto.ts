import { ArrayMinSize, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateCartDto {
  @IsUUID('all', { each: true })
  @IsNotEmpty()
  @ArrayMinSize(1)
  productMetaId: string[];
}
