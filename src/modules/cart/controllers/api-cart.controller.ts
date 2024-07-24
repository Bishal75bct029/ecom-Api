import { Controller, Post, Body, Req, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CartService } from '../services/cart.service';
import { CreateCartDto } from '../dto';
import { Request } from 'express';
import { In } from 'typeorm';
import { ProductService } from '@/modules/product/services';
import { SchoolDiscountService } from '@/modules/school-discount/services/schoolDiscount.service';

@ApiTags('API Cart')
@Controller('api/carts')
export class ApiCartController {
  constructor(
    private readonly cartService: CartService,
    private readonly productService: ProductService,
    private readonly schoolDiscount: SchoolDiscountService,
  ) {}

  @Get()
  async getAllCartItems(@Req() req: Request) {
    const { schoolId } = req.currentUser;
    const discount = await this.schoolDiscount.findOne({ where: { schoolId } });
    const userCarts = await this.cartService.findOne({
      where: {
        user: {
          id: req.currentUser.id,
        },
      },
    });

    if (!userCarts) return [];

    const cartItems = await this.productService.find({
      where: {
        productMeta: {
          id: In(userCarts.productMetaId),
        },
      },
      relations: ['productMeta'],
    });

    if (discount) {
      return cartItems.map((product) => {
        return {
          ...product,
          productMeta: product.productMeta.map((meta) => {
            return {
              ...meta,
              price: meta.price * (1 - discount.discountPercentage / 100),
            };
          }),
        };
      });
    }

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
