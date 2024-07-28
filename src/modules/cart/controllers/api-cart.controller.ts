import { Controller, Post, Body, Req, Get, BadRequestException, Put } from '@nestjs/common';
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
              price: Number(meta.price),
              discountPrice: Number(meta.price) * (1 - discount.discountPercentage / 100),
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
      if (
        isUserCartAvailable.productMetaId.filter((meta) => createCartDto.productMetaId.some((pMeta) => pMeta === meta))
          .length > 0
      ) {
        throw new BadRequestException('Product already added to cart!');
      }
      return await this.cartService.createAndSave({
        ...createCartDto,
        productMetaId: [...isUserCartAvailable.productMetaId, ...createCartDto.productMetaId],
        id: isUserCartAvailable.id,
      });
    }

    return await this.cartService.createAndSave({ ...createCartDto, user: { id: req.currentUser.id } });
  }

  @Put()
  async removeFromCart(@Body() createCartDto: CreateCartDto, @Req() req: Request) {
    const isUserCartAvailable = await this.cartService.findOne({
      where: {
        user: {
          id: req.currentUser.id,
        },
      },
    });

    if (!isUserCartAvailable) throw new BadRequestException('Product not found in cart!');

    if (
      isUserCartAvailable.productMetaId.filter((meta) => createCartDto.productMetaId.some((pMeta) => pMeta === meta))
        .length === 0
    ) {
      throw new BadRequestException('Product not found in cart!');
    }

    return await this.cartService.createAndSave({
      ...createCartDto,
      productMetaId: isUserCartAvailable.productMetaId.filter((meta) => !createCartDto.productMetaId.includes(meta)),
      id: isUserCartAvailable.id,
    });
  }
}
