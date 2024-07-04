import { Controller, Post, Body, Put, Param, BadRequestException, Req, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CartService } from '../services/cart.service';
import { CreateCartDto } from '../dto';
import { Request } from 'express';
import { In } from 'typeorm';
import { ProductMetaService, ProductService } from '@/modules/product/services';

@ApiTags('API Cart')
@Controller('api/carts')
export class ApiCartController {
  constructor(
    private readonly cartService: CartService,
    private readonly productService: ProductService,
  ) {}

  @Get()
  async getAllCartItems(@Req() req: Request) {
    const productMetaId = await this.cartService.findOne({
      where: {
        user: {
          id: req.currentUser.id,
        },
      },
    });

    const cartItems = await this.productService.find({
      where: {
        productMeta: {
          id: In(productMetaId.productMetaId),
        },
      },
      relations: ['productMeta'],
    });

    return cartItems;
  }

  @Post()
  async addToCart(@Body() createCartDto: CreateCartDto) {
    const isUserCartAvailable = await this.cartService.findOne({
      where: {
        user: { id: createCartDto.userId },
      },
    });

    if (isUserCartAvailable) {
      return this.cartService.createAndSave({
        id: isUserCartAvailable.id,
        productMetaId: Array.from(new Set([...isUserCartAvailable.productMetaId, ...createCartDto.productMetaId])),
        user: {
          id: createCartDto.userId,
        },
      });
    }

    return this.cartService.createAndSave({
      productMetaId: createCartDto.productMetaId,
      user: {
        id: createCartDto.userId,
      },
    });
  }
}
