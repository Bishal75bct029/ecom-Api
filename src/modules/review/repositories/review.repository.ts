import { Injectable } from '@nestjs/common';
import { AbstractService } from '@/libs/service/abstract.service';
import { ReviewEntity } from '../entities/review.entity';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { OrderItemEntity } from '@/modules/order/entities/order-item.entity';
import { OrderEntity, OrderStatusEnum } from '@/modules/order/entities/order.entity';

@Injectable()
export class ReviewRepository extends AbstractService<ReviewEntity> {
  constructor(
    @InjectRepository(ReviewEntity) private readonly reviewRepository: Repository<ReviewEntity>,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {
    super(reviewRepository);
  }

  async hasProductDelivered(productMetaIds: string[], userId: string): Promise<boolean> {
    const count = await this.dataSource
      .createQueryBuilder()
      .select('oi.orderId')
      .from(OrderItemEntity, 'oi')
      .innerJoin(OrderEntity, 'o', 'o.id = oi.orderId')
      .where('oi.productMetaId IN (:...ids) and o.status = :status and o.userId = :userId', {
        ids: productMetaIds,
        status: OrderStatusEnum.DELIVERED,
        userId: userId,
      })
      .getCount();

    return count > 0;
  }
}
