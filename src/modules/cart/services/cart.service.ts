import { Injectable } from '@nestjs/common';
import { AbstractService } from '@/libs/service/abstract.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartEntity } from '../entities/cart.entity';

@Injectable()
export class CartService extends AbstractService<CartEntity> {
  constructor(@InjectRepository(CartEntity) private readonly itemRepository: Repository<CartEntity>) {
    super(itemRepository);
  }
}
