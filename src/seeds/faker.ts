import { CreateCategoryDto } from '@/modules/category/dto';
import { CreateProductDto, CreateProductMetaDto } from '@/modules/product/dto';
import { CreateSchoolDiscountDto } from '@/modules/school-discount/dtos/create-schoolDiscount.dto';
import { CreateAdminUserDto } from '@/modules/user/dto';
import { faker } from '@faker-js/faker';

export function generateSchoolDiscount(): CreateSchoolDiscountDto {
  return {
    schoolId: faker.string.uuid(),
    name: faker.company.name(),
    discountPercentage: faker.number.int({ max: 100 }),
    schoolMeta: {
      location: faker.company.buzzNoun(),
    },
  };
}

export function generateUsers(): CreateAdminUserDto {
  return {
    email: faker.internet.email(),
    password: faker.internet.password(),
    name: faker.internet.userName(),
    isOtpEnabled: faker.datatype.boolean(),
  };
}

export function generateProductMeta(): CreateProductMetaDto {
  return {
    sku: faker.word.sample(),
    image: faker.image.url(),
    price: faker.number.int({ min: 10, max: 1000 }),
    variants: { color: faker.color.human(), size: faker.helpers.arrayElement(['S', 'M', 'L', 'XL']) },
    isDefault: faker.datatype.boolean(),
    stock: faker.number.int({ min: 0, max: 100 }),
  };
}

export function generateProduct(): CreateProductDto {
  const productMetaCount = faker.number.int({ min: 1, max: 5 });
  const productMetas: CreateProductMetaDto[] = [];

  for (let i = 0; i < productMetaCount; i++) {
    productMetas.push(generateProductMeta());
  }

  return {
    name: faker.commerce.productName(),
    description: faker.commerce.productDescription(),
    tags: faker.word.words(5).split(' '),
    attributes: faker.helpers.arrayElements(['color', 'size']),
    variants: [{ color: faker.color.human(), size: faker.helpers.arrayElement(['S', 'M', 'L', 'XL']) }],
    attributeOptions: { color: [faker.color.human(), faker.color.human()], size: ['S', 'M', 'L', 'XL'] },
    productMetas,
    categoryIds: Array.from({ length: faker.number.int({ min: 1, max: 3 }) }, () => faker.string.uuid()),
  };
}

export function generateCategories(): CreateCategoryDto {
  return {
    name: faker.commerce.productAdjective(),
    image: faker.image.url(),
    parent: faker.commerce.productAdjective(),
  };
}

function findMethod(methodName: string) {
  const seed = {
    user: generateUsers,
    product: generateProduct,
    productMeta: generateProductMeta,
    category: generateCategories,
    schoolDiscount: generateSchoolDiscount,
  };

  return seed[methodName];
}

export const data = faker.helpers.multiple(generateProduct, {
  count: 2,
});

(() => {
  const method = process.argv;
  for (let i = 2; i < method.length; i++) {
    console.log(faker.helpers.multiple(findMethod(method[i])));
  }
})();
// console.log(data[0].productMetas);
