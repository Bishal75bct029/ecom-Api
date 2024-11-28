import { Controller, Post, Body, Req, Get, BadRequestException, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CartService } from '../services/cart.service';
import { CreateCartDto, RemoveCartDto } from '../dto';
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
    const productMetaIds = userCarts.cartItems.map((item) => {
      return item.productMetaId;
    });

    const cartProducts = await this.productService.find({
      where: {
        productMeta: {
          id: In(productMetaIds),
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

    const cartItems = cartProducts?.map((product) => {
      return {
        ...product,
        productMeta: product.productMeta?.map((meta) => {
          const item = userCarts?.cartItems.find((item) => {
            return item.productMetaId == meta.id;
          });
          return {
            ...meta,
            quantity: item.quantity,
          };
        }),
      };
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
    const { productMetaId, quantity = 1 } = createCartDto;
    const product = await this.productMetaService.findOne({
      where: { id: productMetaId },
    });

    if (!product) {
      throw new BadRequestException('Provide correct product meta id!');
    }

    const isUserCartAvailable = await this.cartService.findOne({
      where: {
        user: {
          id: req.currentUser.id,
        },
      },
    });

    if (isUserCartAvailable) {
      const cart = isUserCartAvailable.cartItems.find((meta) => {
        return meta.productMetaId === productMetaId;
      });

      if (cart) {
        const cartItems = isUserCartAvailable.cartItems.map((item) => {
          if (item.productMetaId === productMetaId) return { ...item, quantity: cart.quantity + quantity };
          return item;
        });
        return this.cartService.createAndSave({
          id: isUserCartAvailable.id,
          cartItems,
        });
      }

      return this.cartService.createAndSave({
        id: isUserCartAvailable.id,
        cartItems: [...isUserCartAvailable.cartItems, { ...createCartDto }],
      });
    }

    return this.cartService.createAndSave({
      user: { id: req.currentUser.id },
      cartItems: [{ productMetaId, quantity }],
    });
  }

  @Put()
  async removeFromCart(@Body() removeCartDto: RemoveCartDto, @Req() req: Request) {
    const isUserCartAvailable = await this.cartService.findOne({
      where: {
        user: {
          id: req.currentUser.id,
        },
      },
    });

    if (!isUserCartAvailable) throw new BadRequestException('Product not found in cart!');

    return await this.cartService.createAndSave({
      ...isUserCartAvailable,
      cartItems: isUserCartAvailable.cartItems.filter((item) => item.productMetaId !== removeCartDto.productMetaId),
      id: isUserCartAvailable.id,
    });
  }
}
