import { Controller, Post, Body, Put, Param, BadRequestException, Req, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CartService } from '../services/cart.service';
import { CreateCartDto } from '../dto';
import { Request } from 'express';

@ApiTags('API Cart')
@Controller('api/carts')
export class ApiCartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  async getAllCartItems(@Req() req: Request) {
    const cartItems = await this.cartService.find({
      where: {
        userId: req.currentUser.id,
      },
    });

    return cartItems;
  }

  @Post()
  async addToCart(@Body() createCartDto: CreateCartDto) {
    const isUserCartAvailable = await this.cartService.findOne({ where: { userId: createCartDto.userId } });
    if (isUserCartAvailable) {
      return this.cartService.createAndSave({ ...createCartDto, id: isUserCartAvailable.id });
    }

    return this.cartService.createAndSave(createCartDto);
  }

  //   @Put(':id')
  //   async updateCartItems(@Body() createCartDto: CreateCartDto, @Param('id') id: string) {
  //     const isCartAvailable = await this.cartService.findOne({ where: { id } });
  //     if (!isCartAvailable) {
  //       throw new BadRequestException('Cart not found');
  //     }

  //     const isUserCartAvailable = await this.cartService.findOne({ where: { userId: createCartDto.userId } });
  //     if (!isUserCartAvailable) {
  //       throw new BadRequestException('User cart not found');
  //     }

  //     return this.cartService.createAndSave({ ...createCartDto, id: isUserCartAvailable.id });
  //   }

  async delete(@Param() id: string) {
    this.cartService.delete;
  }
}
