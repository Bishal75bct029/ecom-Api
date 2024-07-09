import { Injectable } from '@nestjs/common';
import { AbstractService } from '@/libs/service/abstract.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartEntity } from '../entities/cart.entity';
import { CreateCartDto } from '../dto';

@Injectable()
export class CartRepository extends AbstractService<CartEntity> {
  constructor(@InjectRepository(CartEntity) private readonly itemRepository: Repository<CartEntity>) {
    super(itemRepository);
  }

  // async getUserCarts(id: string) {
  //   return this.findOne({
  //     where: {
  //       user: { id },
  //     },
  //   });
  // }

  // async saveCart(cartItems: CreateCartDto) {
  //   return this.createAndSave({
  //     productMetaId: cartItems.productMetaId,
  //     user: {
  //       id: cartItems.userId,
  //     },
  //   });
  // }
}
