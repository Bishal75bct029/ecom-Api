import { Module } from '@nestjs/common';
import { OrderService } from './services/order.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderEntity } from './entities/order.entity';
import { OrderItemEntity } from './entities/order-item.entity';
import { ApiOrderController } from './controllers/api-order.controller';
import { AdminOrderController } from './controllers/admin-order.controller';
import { OrderItemService } from './services/order-item.service';
import { ProductModule } from '../product/product.module';
import { PaymentModule } from '@/common/module/payment/payment.module';
import { TransactionModule } from '../transaction/transaction.module';
import { PaymentMethodModule } from '../payment-method/payment-method.module';
import { SchoolDiscountModule } from '../school-discount/school-discount.module';
import { CartModule } from '../cart/cart.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrderEntity, OrderItemEntity]),
    ProductModule,
    SchoolDiscountModule,
    PaymentModule,
    TransactionModule,
    PaymentMethodModule,
    PaymentModule,
    CartModule,
  ],
  controllers: [ApiOrderController, AdminOrderController],
  providers: [OrderService, OrderItemService],
})
export class OrderModule {}
