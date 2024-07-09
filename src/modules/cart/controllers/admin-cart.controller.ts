import { Controller, Post, Body } from '@nestjs/common';
import { CartService } from '../services/cart.service';
import { CreateCartDto } from '../dto';

@Controller('admin/carts')
export class AdminCartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  create(@Body() createCartDto: CreateCartDto) {
    return this.cartService.create(createCartDto);
  }
}
