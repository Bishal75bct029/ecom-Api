import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { ApiCartController } from './api-cart.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartEntity } from './entities/cart.entity';
import { AdminCartController } from './admin-cart.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CartEntity])],
  controllers: [ApiCartController, AdminCartController],
  providers: [CartService],
})
export class CartModule {}
