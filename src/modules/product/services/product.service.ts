import { Injectable } from '@nestjs/common';
import { ProductRepository } from '../repositories/product.repository';
import combinate from 'combinate';
import { PRODUCT_STATUS_ENUM, type ProductEntity, type ProductMetaEntity } from '../entities';
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

  validateStatusChange(currentStatus: PRODUCT_STATUS_ENUM, statusToChange: PRODUCT_STATUS_ENUM) {
    if (currentStatus === statusToChange) {
      return true;
    }
    switch (currentStatus) {
      case PRODUCT_STATUS_ENUM.DRAFT:
        return [PRODUCT_STATUS_ENUM.SCHEDULED, PRODUCT_STATUS_ENUM.PUBLISHED].includes(statusToChange);
      case PRODUCT_STATUS_ENUM.SCHEDULED:
        return [PRODUCT_STATUS_ENUM.DRAFT, PRODUCT_STATUS_ENUM.PUBLISHED].includes(statusToChange);
      case PRODUCT_STATUS_ENUM.PUBLISHED:
        return false;
      default:
        return false;
    }
  }

  async findNewMetaIdsForProduct(existingMetas: ProductMetaEntity[], updatedMetas: CreateProductMetaDto[]) {
    const existingVariantsMap = new Map(existingMetas.map((variant) => [variant.id, variant]));
    const newMetaIds = [];

    for (const variant of updatedMetas) {
      const existingVariant = existingVariantsMap.get(variant.id);
      if (!existingVariant) {
        newMetaIds.push(variant.id);
      }
    }

    return newMetaIds;
  }
}
