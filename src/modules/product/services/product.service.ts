import { Injectable } from '@nestjs/common';
import { ProductRepository } from '../repositories/product.repository';
import combinate from 'combinate';
import { PRODUCT_STATUS_ENUM, ProductEntity } from '../entities';
import { Attribute, CreateProductMetaDto } from '../dto';
import { getRoundedOffValue } from '@/common/utils';
import type { CategoryEntity } from '@/modules/category/entities/category.entity';

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
  findLastCategory(categories: CategoryEntity[]) {
    if (categories.length === 0) return null;

    const categoryMap = new Map<string, CategoryEntity[]>();
    let rootCategory: CategoryEntity | null = null;

    for (const category of categories) {
      if (!category.id) continue;

      if (category.parent === null) {
        rootCategory = category;
      } else {
        const parentId = category.parent.id;
        if (!categoryMap.has(parentId)) {
          categoryMap.set(parentId, []);
        }
        categoryMap.get(parentId)!.push(category);
      }
    }

    if (!rootCategory) return null;

    const findLast = (category: CategoryEntity): string => {
      const children = categoryMap.get(category.id) || [];
      if (children.length === 0) {
        return category.id;
      }
      return findLast(children[children.length - 1]);
    };

    return findLast(rootCategory);
  }
}
