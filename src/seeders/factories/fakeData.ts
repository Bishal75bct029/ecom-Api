import { UserRoleEnum } from '@/modules/user/entities';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';

export function generateSchoolDiscount() {
  return {
    schoolId: faker.string.uuid(),
    name: faker.company.name(),
    discountPercentage: faker.number.int({ max: 100 }),
    schoolMeta: {
      location: faker.company.buzzNoun(),
    },
  };
}

export function generateUsers() {
  return {
    email: faker.internet.email(),
    password: bcrypt.hashSync('password', 10),
    name: faker.internet.userName(),
    role: faker.helpers.arrayElement(Object.values(UserRoleEnum)),
    isOtpEnabled: faker.datatype.boolean(),
  };
}

export function generateProductMeta(isDefault: boolean) {
  return {
    sku: String(Date.now() + Math.floor(Math.random() * 1000)),
    image: faker.image.url(),
    price: faker.number.int({ min: 10, max: 10000000 }) * 100,
    variants: {
      storage: faker.helpers.arrayElement(['64GB', '128GB', '256GB', '512GB', '1TB']),
      RAM: faker.helpers.arrayElement(['2GB', '4GB', '8GB', '16GB', '32GB']),
    },
    isDefault: isDefault,
    stock: faker.number.int({ min: 0, max: 100 }),
  };
}

export function generateProduct() {
  const productMetaCount = faker.number.int({ min: 1, max: 5 });
  const productMetas = [];

  productMetas.push(generateProductMeta(true));
  for (let i = 1; i < productMetaCount; i++) {
    productMetas.push(generateProductMeta(false));
  }

  return {
    name: faker.helpers.arrayElement([
      'Brand New Device',
      '5G Cell Phone',
      'Tablets',
      'High Performant Gaming Laptop',
      'Super Quality Phone',
    ]),
    description: faker.commerce.productDescription(),
    tags: faker.word.words(5).split(' '),
    attributes: faker.helpers.arrayElements(['storage', 'RAM']),
    variants: [
      {
        storage: faker.helpers.arrayElement(['64GB', '128GB', '256GB', '512GB', '1TB']),
        RAM: faker.helpers.arrayElement(['2GB', '4GB', '8GB', '16GB', '32GB']),
      },
    ],
    attributeOptions: {
      color: [faker.helpers.arrayElement(['64GB', '128GB', '256GB', '512GB', '1TB'])],
      size: ['2GB', '4GB', '8GB', '16GB', '32GB'],
    },
    productMetas,
    categoryIds: Array.from({ length: faker.number.int({ min: 1, max: 3 }) }, () => faker.string.uuid()),
  };
}

export function generateCategories() {
  return [
    {
      name: 'Electronic Devices',
      image: faker.image.url(),
      parent: null,
      children: [
        {
          name: 'SmartPhones',
          image: faker.image.url(),
          children: [
            {
              name: 'Samsung Mobile',
              image: faker.image.url(),
              children: null,
              parent: {
                name: 'Electronic Devices',
                image: faker.image.url(),
              },
            },
            {
              name: 'Redmi Mobile',
              image: faker.image.url(),
              children: null,
            },
          ],
        },
        {
          name: 'Tablet',
          image: faker.image.url(),
          children: [
            {
              name: 'Apple Ipads',
              image: faker.image.url(),
              children: null,
            },
            {
              name: 'Xiami Pad',
              image: faker.image.url(),
              children: null,
            },
          ],
        },
        {
          name: 'Laptops',
          image: faker.image.url(),
          children: [
            {
              name: 'M1 Air',
              image: faker.image.url(),
              children: null,
            },
            {
              name: 'Lenovo',
              image: faker.image.url(),
              children: null,
            },
            {
              name: 'ACER',
              image: faker.image.url(),
              children: null,
            },
          ],
        },
      ],
    },
  ];
}
