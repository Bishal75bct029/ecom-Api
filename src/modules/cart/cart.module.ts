import { Module } from '@nestjs/common';
import { CartService } from './services/cart.service';
import { ApiCartController, AdminCartController } from './controllers';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartEntity } from './entities/cart.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CartEntity])],
  controllers: [ApiCartController, AdminCartController],
  providers: [CartService],
})
export class CartModule {}
