import { Module } from '@nestjs/common';
import { OrderService } from './services/order.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderEntity } from './entities/order.entity';
import { OrderItemEntity } from './entities/order-item.entity';
import { ApiOrderController } from './controllers/api-order.controller';
import { AdminOrderController } from './controllers/admin-order.controller';
import { OrderItemService } from './services/order-item.service';
import { UserModule } from '../user/user.module';
import { ProductModule } from '../product/product.module';
import { DiscountModule } from '../discount/discount.module';
import { PaymentModule } from '@/common/module/payment/payment.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrderEntity, OrderItemEntity]),
    UserModule,
    ProductModule,
    DiscountModule,
    PaymentModule,
  ],
  controllers: [ApiOrderController, AdminOrderController],
  providers: [OrderService, OrderItemService],
})
export class OrderModule {}
