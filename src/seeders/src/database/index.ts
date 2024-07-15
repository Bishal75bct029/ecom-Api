import { DataSource } from 'typeorm';
import { UserEntity } from './models/user.entity';
import { ReviewEntity } from './models/review.entity';
import { OrderEntity } from './models/order.entity';
import { OrderItemEntity } from './models/orderItem.entity';
import { ProductEntity } from './models/product.entity';
import { ProductMetaEntity } from './models/productMeta.entity';
import { SchoolDiscountEntity } from './models/schoolDiscount.entity';
import { CategoryEntity } from './models/category.entity';
import { DiscountEntity } from './models/discount.entity';
import { AddressEntity } from './models/address.entity';

export const dataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'Welcome',
  database: 'ecom',
  entities: [
    UserEntity,
    ReviewEntity,
    OrderEntity,
    OrderItemEntity,
    ProductEntity,
    ProductMetaEntity,
    SchoolDiscountEntity,
    CategoryEntity,
    DiscountEntity,
    AddressEntity,
  ],
});
