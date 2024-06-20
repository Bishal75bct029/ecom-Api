import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderEntity } from './entities/order.entity';
import { OrderItemEntity } from './entities/order-item.entity';
import { ApiOrderController } from './api-order.controller';
import { AdminOrderController } from './admin-order.controller';

@Module({
  imports: [TypeOrmModule.forFeature([OrderEntity, OrderItemEntity])],
  controllers: [ApiOrderController, AdminOrderController],
  providers: [OrderService],
})
export class OrderModule {}
