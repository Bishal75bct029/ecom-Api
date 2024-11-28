import { Controller } from '@nestjs/common';

import { CartService } from '../services/cart.service';

@Controller('admin/carts')
export class AdminCartController {
  constructor(private readonly cartService: CartService) {}
}
