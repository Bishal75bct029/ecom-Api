import { dataSource } from '..';
import { generateProduct } from '../factories/fakeData';
import { CategoryEntity } from '../models/category.entity';
import { ProductEntity } from '../models/product.entity';
import { ProductMetaEntity } from '../models/productMeta.entity';
import { UserEntity } from '../models/user.entity';

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
    const allCategory = await dataSource.getRepository(CategoryEntity).createQueryBuilder('category').getMany();

    product.categories = allCategory;

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
