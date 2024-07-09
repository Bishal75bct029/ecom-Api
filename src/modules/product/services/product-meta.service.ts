import { BadRequestException, Injectable } from '@nestjs/common';
import { ProductMetaRepository } from '../repositories/product-meta.repository';
import { CreateOrderDto } from '@/modules/order/dto/create-order.dto';
import { In } from 'typeorm';
import { ProductMetaEntity } from '../entities';

@Injectable()
export class ProductMetaService extends ProductMetaRepository {
  async validateQuantity(productMetas: ProductMetaEntity[], createOrderDto: CreateOrderDto) {
    for (const product of productMetas) {
      const productFromOrder = createOrderDto.productMetaIds.find((item) => item.id === product.id);

      if (product.stock < productFromOrder.quantity)
        throw new BadRequestException('Quantity exceeds available quantity');
    }
  }

  async updateStock(createOrderDto: CreateOrderDto) {
    const productMetas = await this.find({
      where: { id: In(createOrderDto.productMetaIds.map(({ id }) => id)) },
    });

    for await (const product of productMetas) {
      const productFromOrder = createOrderDto.productMetaIds.find((item) => item.id === product.id);
      this.createAndSave({ ...product, stock: product.stock - productFromOrder.quantity });
    }
  }
}
