import { Controller, Post, Body, Req, Get, BadRequestException, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CartService } from '../services/cart.service';
import { CreateCartDto } from '../dto';
import { Request } from 'express';
import { In } from 'typeorm';
import { ProductMetaService, ProductService } from '@/modules/product/services';
import { SchoolDiscountService } from '@/modules/school-discount/services/schoolDiscount.service';

@ApiTags('API Cart')
@ApiBearerAuth()
@Controller('api/carts')
export class ApiCartController {
  constructor(
    private readonly cartService: CartService,
    private readonly productService: ProductService,
    private readonly productMetaService: ProductMetaService,
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
    const products = await this.productMetaService.find({ where: { id: In(createCartDto.productMetaId) } });

    if (products.length !== createCartDto.productMetaId.length) {
      throw new BadRequestException('Provide correct product meta ids!');
    }

    const isUserCartAvailable = await this.cartService.findOne({
      where: {
        user: {
          id: req.currentUser.id,
        },
      },
    });

    if (
      isUserCartAvailable &&
      isUserCartAvailable.productMetaId.some((meta) => createCartDto.productMetaId.includes(meta))
    ) {
      throw new BadRequestException('Product already in cart!');
    }

    return await this.cartService.createAndSave({
      id: isUserCartAvailable ? isUserCartAvailable.id : undefined,
      productMetaId:
        isUserCartAvailable && isUserCartAvailable.productMetaId?.length
          ? [...new Set([...isUserCartAvailable.productMetaId, ...createCartDto.productMetaId])]
          : createCartDto.productMetaId,
      user: { id: req.currentUser.id },
    });
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

    return await this.cartService.createAndSave({
      ...createCartDto,
      productMetaId: isUserCartAvailable.productMetaId.filter((meta) => !createCartDto.productMetaId.includes(meta)),
      id: isUserCartAvailable.id,
    });
  }
}
