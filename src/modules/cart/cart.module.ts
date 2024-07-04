import { Module } from '@nestjs/common';
import { CartService } from './services/cart.service';
import { ApiCartController, AdminCartController } from './controllers';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartEntity } from './entities/cart.entity';
import { ProductMetaService } from '../product/services';
import { ProductModule } from '../product/product.module';

@Module({
  imports: [TypeOrmModule.forFeature([CartEntity]), ProductModule],
  controllers: [ApiCartController, AdminCartController],
  providers: [CartService],
})
export class CartModule {}
