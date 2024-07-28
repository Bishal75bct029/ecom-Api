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
      select: {
        id: true,
        name: true,
        productMeta: {
          id: true,
          image: true,
          price: true,
          stock: true,
          variant: {},
        },
      },
      relations: ['productMeta'],
    });

    console.log(cartItems);

    const schoolDiscount = await this.schoolDiscount.findOne({
      where: { schoolId },
      select: ['discountPercentage'],
      cache: true,
    });

    return schoolDiscount
      ? this.productService.getDiscountedProducts(cartItems, schoolDiscount.discountPercentage)
      : this.productService.getDiscountedProducts(cartItems);
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
