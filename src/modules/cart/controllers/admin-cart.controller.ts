import { Controller, Post, Body } from '@nestjs/common';
import { CartService } from '../services/cart.service';
import { CreateCartDto } from '../dto';
import { CartRepository } from '../repositories/cart.repository';

@Controller('admin/carts')
export class AdminCartController {
  constructor(
    private readonly cartService: CartService,
    private readonly cartRepository: CartRepository,
  ) {}

  @Post()
  create(@Body() createCartDto: CreateCartDto) {
    return this.cartService.saveCart(createCartDto);
  }
}
