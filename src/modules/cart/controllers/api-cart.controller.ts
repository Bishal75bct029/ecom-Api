import { Controller, Post, Body, Put, Param, BadRequestException } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CartService } from '../services/cart.service';
import { CreateCartDto } from '../dto';

@ApiTags('API Cart')
@Controller('api/carts')
export class ApiCartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  async addToCart(@Body() createCartDto: CreateCartDto) {
    const isUserCartAvailable = await this.cartService.findOne({ where: { userId: createCartDto.userId } });
    if (isUserCartAvailable) {
      return this.cartService.createAndSave({ ...createCartDto, id: isUserCartAvailable.id });
    }
    return this.cartService.createAndSave(createCartDto);
  }

  @Put(':id')
  async updateCartItems(@Body() createCartDto: CreateCartDto, @Param('id') id: string) {
    const isCartAvailable = await this.cartService.findOne({ where: { id } });
    if (!isCartAvailable) {
      throw new BadRequestException('Cart not found');
    }

    const isUserCartAvailable = await this.cartService.findOne({ where: { userId: createCartDto.userId } });
    if (!isUserCartAvailable) {
      throw new BadRequestException('User cart not found');
    }

    return this.cartService.createAndSave({ ...createCartDto, id: isUserCartAvailable.id });
  }
}
