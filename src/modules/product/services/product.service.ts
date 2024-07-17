import { Injectable } from '@nestjs/common';
import { ProductRepository } from '../repositories/product.repository';
import combinate from 'combinate';
import { ProductEntity } from '../entities';

@Injectable()
export class ProductService extends ProductRepository {
  generateProductAttibutes(attributeOptions: Record<string, any>) {
    return combinate(attributeOptions);
  }

  getDiscountedProducts(products: ProductEntity[], discountPercentage: number) {
    return products.map((product) => {
      return {
        ...product,
        productMeta: product.productMeta.map((meta) => {
          return {
            ...meta,
            price: Number(meta.price),
            discountPrice: Number(meta.price) - (Number(discountPercentage) * Number(meta.price)) / 100,
          };
        }),
      };
    });
  }
}
