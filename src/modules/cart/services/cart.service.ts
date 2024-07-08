import { Injectable } from '@nestjs/common';
import { CartRepository } from '../repositories/cart.repository';
import { CreateCartDto } from '../dto';

@Injectable()
export class CartService extends CartRepository {
  constructor(public readonly cartRepository: CartRepository) {
    super();
  }

  async getUserCarts(id: string) {
    return this.cartRepository.getUserCarts(id);
  }

  async saveCart(cartItems: CreateCartDto) {
    return this.cartRepository.createAndSave(cartItems);
  }
}
