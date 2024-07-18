import { Injectable } from '@nestjs/common';
import { ProductRepository } from '../repositories/product.repository';
import combinate from 'combinate';
import { ProductEntity } from '../entities';
import { CreateProductMetaDto } from '../dto';

@Injectable()
export class ProductService extends ProductRepository {
  generateProductAttibutes(attributeOptions: Record<string, any>) {
    return combinate(attributeOptions);
  }
  getDiscountedProducts<T>(product: T, discountPercentage?: number): T;
  getDiscountedProducts<T>(product: T[], discountPercentage?: number): T[];

  getDiscountedProducts(products: ProductEntity | ProductEntity[], discountPercentage: number = 0) {
    if (Array.isArray(products)) {
      return products.map((product) => ({
        ...product,
        productMeta: product.productMeta.map((meta) => ({
          ...meta,
          price: Number(meta.price) / 100,
          discountPrice: (Number(meta.price) - (discountPercentage * Number(meta.price)) / 100) / 100,
          discountPercentage: discountPercentage ?? 0,
        })),
      }));
    }
    return {
      ...products,
      productMeta: products.productMeta.map((meta) => ({
        ...meta,
        price: Number(meta.price) / 100,
        discountPrice: (Number(meta.price) - (discountPercentage * Number(meta.price)) / 100) / 100,
        discountPercentage: discountPercentage ?? 0,
      })),
    };
  }

  validateVariant(attributeOptions: { [key: string]: string[] }, productMeta: CreateProductMetaDto[]): boolean {
    const generatedVariants = combinate(attributeOptions);
    const attributes = Object.keys(generatedVariants[0]);

    for (const meta of productMeta) {
      console.log(meta.variant);
      if (!meta.variant) continue;
      const isValidVariant = generatedVariants.some((variant) => {
        return attributes.every((attribute) => {
          console.log(variant[attribute] === meta.variant[attribute]);
          return variant[attribute] === meta.variant[attribute];
        });
      });

      if (!isValidVariant) {
        console.log(meta.variant, generatedVariants);
        return false;
      }
    }

    return true;
  }
}
