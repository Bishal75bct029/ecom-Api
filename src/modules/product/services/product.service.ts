import { Injectable } from '@nestjs/common';
import { ProductRepository } from '../repositories/product.repository';
import combinate from 'combinate';
import { ProductEntity } from '../entities';
import { Attribute, CreateProductMetaDto } from '../dto';
import { getRoundedOffValue } from '@/common/utils';

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
          price: getRoundedOffValue(Number(meta.price) / 10000),
          discountPrice: getRoundedOffValue((Number(meta.price) * (1 - discountPercentage / 100)) / 10000),
          discountPercentage: discountPercentage ?? 0,
        })),
      }));
    }

    return {
      ...products,
      productMeta: products.productMeta.map((meta) => ({
        ...meta,
        price: getRoundedOffValue(Number(meta.price) / 10000),
        discountPrice: getRoundedOffValue((Number(meta.price) * (1 - discountPercentage / 100)) / 10000),
        discountPercentage: discountPercentage ?? 0,
      })),
    };
  }

  validateVariant(attributeOptions: Attribute[], productMeta: CreateProductMetaDto[]): boolean {
    const formattedAttribute: Record<string, string[]> = {};
    attributeOptions.forEach((attribute) => {
      formattedAttribute[attribute.attributeName] = attribute.attributeValues.map((value) => value.value);
    });

    const generatedVariants = combinate(formattedAttribute);
    const attributes = Object.keys(generatedVariants[0]);

    for (const meta of productMeta) {
      if (!meta.attributes) continue;
      const isValidVariant = generatedVariants.some((variant) => {
        return attributes.every((attribute) => {
          return variant[attribute] === meta.attributes[attribute];
        });
      });

      if (!isValidVariant) {
        return false;
      }
    }

    return true;
  }
}
