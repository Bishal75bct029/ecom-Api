import { ProductEntity, ProductMetaEntity } from '@/modules/product/entities';
import { generateProduct } from '../factories/fakeData';
import dataSource from '@/configs/typeorm';
import { CategoryEntity } from '@/modules/category/entities/category.entity';

export async function seedProductsWithMetas() {
  const products = [generateProduct()];

  for (const productData of products) {
    const product = new ProductEntity();
    product.name = productData.name;
    product.description = productData.description;
    product.tags = productData.tags;
    product.attributes = productData.attributes;
    product.attributesOptions = productData.attributeOptions;
    product.variants = productData.variants;

    await dataSource.initialize();
    product.categories = await dataSource
      .getRepository(CategoryEntity)
      .createQueryBuilder('category')
      .orderBy('RANDOM()')
      .limit(1)
      .getMany();

    const savedProduct = await dataSource.manager.save(ProductEntity, product);

    if (productData.productMetas && productData.productMetas.length > 0) {
      for (const productMetaData of productData.productMetas) {
        const productMeta = new ProductMetaEntity();
        productMeta.sku = productMetaData.sku;
        productMeta.image = productMetaData.image;
        productMeta.price = productMetaData.price;
        productMeta.variants = productMetaData.variants;
        productMeta.isDefault = productMetaData.isDefault;
        productMeta.stock = productMetaData.stock;
        productMeta.product = savedProduct;

        await dataSource.manager.save(ProductMetaEntity, productMeta);
      }
    }
  }

  console.log(`Products and ProductMetas Inserted Successfully`);
}
