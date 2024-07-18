import { Module } from '@nestjs/common';
import { CartService } from './services/cart.service';
import { ApiCartController, AdminCartController } from './controllers';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartEntity } from './entities/cart.entity';
import { ProductModule } from '../product/product.module';
import { CartRepository } from './repositories/cart.repository';
import { UserModule } from '../user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([CartEntity]), ProductModule, UserModule],
  controllers: [ApiCartController, AdminCartController],
  providers: [CartService, CartRepository],
})
export class CartModule {}
