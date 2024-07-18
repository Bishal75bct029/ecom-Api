import { Controller, Post, Body, Req, Get, NotFoundException, BadRequestException } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CartService } from '../services/cart.service';
import { CreateCartDto } from '../dto';
import { Request } from 'express';
import { In } from 'typeorm';
import { ProductService } from '@/modules/product/services';
import { UserService } from '@/modules/user/services';

@ApiTags('API Cart')
@Controller('api/carts')
export class ApiCartController {
  constructor(
    private readonly cartService: CartService,
    private readonly productService: ProductService,
    private readonly userService: UserService,
  ) {}

  @Get()
  async getAllCartItems(@Req() req: Request) {
    const userCarts = await this.cartService.findOne({
      where: {
        user: {
          id: req.currentUser.id,
        },
      },
    });

    if (!userCarts) throw new NotFoundException('Cart is empty');

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
  async addToCart(@Body() createCartDto: CreateCartDto, @Req() req: Request) {
    const isUserCartAvailable = await this.cartService.findOne({
      where: {
        user: {
          id: req.currentUser.id,
        },
      },
    });

    if (isUserCartAvailable) {
      return await this.cartService.createAndSave({
        ...createCartDto,
        id: isUserCartAvailable.id,
      });
    }

    return await this.cartService.createAndSave({ ...createCartDto, user: { id: req.currentUser.id } });
  }
}
