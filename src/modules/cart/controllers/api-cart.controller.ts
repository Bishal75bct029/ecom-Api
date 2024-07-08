import { Controller, Post, Body, Put, Param, BadRequestException, Req, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CartService } from '../services/cart.service';
import { CreateCartDto } from '../dto';
import { Request } from 'express';
import { In } from 'typeorm';
import { ProductService } from '@/modules/product/services';

@ApiTags('API Cart')
@Controller('api/carts')
export class ApiCartController {
  constructor(
    private readonly cartService: CartService,
    private readonly productService: ProductService,
  ) {}

  @Get()
  async getAllCartItems(@Req() req: Request) {
    const userCarts = await this.cartService.getUserCarts(req.currentUser.id);

    const cartItems = await this.productService.find({
      where: {
        productMeta: {
          id: In(userCarts.productMetaId),
        },
      },
      relations: ['productMeta'],
    });

    return cartItems;
  }

  @Post()
  async addToCart(@Body() createCartDto: CreateCartDto) {
    const isUserCartAvailable = await this.cartService.getUserCarts(createCartDto.userId);

    if (isUserCartAvailable) {
      return await this.cartService.saveCart({
        ...createCartDto,
        id: isUserCartAvailable.id,
      });
    }

    return await this.cartService.saveCart(createCartDto);
  }
}
