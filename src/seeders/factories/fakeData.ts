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
    isOtpEnabled: faker.datatype.boolean(),
  };
}

export function generateProductMeta() {
  return {
    sku: faker.word.sample(),
    image: faker.image.url(),
    price: faker.number.int({ min: 10, max: 1000 }),
    variants: {
      color: faker.color.human(),
      size: faker.helpers.arrayElement(['S', 'M', 'L', 'XL']),
    },
    isDefault: faker.datatype.boolean(),
    stock: faker.number.int({ min: 0, max: 100 }),
  };
}

export function generateProduct() {
  const productMetaCount = faker.number.int({ min: 1, max: 5 });
  const productMetas = [];

  for (let i = 0; i < productMetaCount; i++) {
    productMetas.push(generateProductMeta());
  }

  return {
    name: faker.commerce.productName(),
    description: faker.commerce.productDescription(),
    tags: faker.word.words(5).split(' '),
    attributes: faker.helpers.arrayElements(['color', 'size']),
    variants: [
      {
        color: faker.color.human(),
        size: faker.helpers.arrayElement(['S', 'M', 'L', 'XL']),
      },
    ],
    attributeOptions: {
      color: [faker.color.human(), faker.color.human()],
      size: ['S', 'M', 'L', 'XL'],
    },
    productMetas: [
      generateProductMeta(),
      generateProductMeta(),
      generateProductMeta(),
      generateProductMeta(),
      generateProductMeta(),
      generateProductMeta(),
    ],
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
              name: 'Mac Books',
              image: faker.image.url(),
              children: null,
            },
            {
              name: 'Lenovo',
              image: faker.image.url(),
              children: null,
            },
          ],
        },
      ],
    },
    {
      name: 'Groceries And Pets',
      image: faker.image.url(),
      parent: null,
      children: [
        {
          name: 'Beverages',
          image: faker.image.url(),
          children: [
            {
              name: 'Tea',
              image: faker.image.url(),
              children: null,
            },
            {
              name: 'Coffee',
              image: faker.image.url(),
              children: null,
            },
          ],
        },
        {
          name: 'Food Staples',
          image: faker.image.url(),
          children: [
            {
              name: 'Rice',
              image: faker.image.url(),
              children: null,
            },
            {
              name: 'Daal',
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
              name: 'Mac Books',
              image: faker.image.url(),
              children: null,
            },
            {
              name: 'Lenovo',
              image: faker.image.url(),
              children: null,
            },
          ],
        },
      ],
    },
    {
      name: 'Home And LifeStyle',
      image: faker.image.url(),
      parent: null,
      children: [
        {
          name: 'Beddings',
          image: faker.image.url(),
          children: [
            {
              name: 'Bed Sheets',
              image: faker.image.url(),
            },
            {
              name: 'Pillow Case',
              image: faker.image.url(),
            },
          ],
        },
        {
          name: 'Lightning',
          image: faker.image.url(),
          children: [
            {
              name: 'Ceiling Lights',
              image: faker.image.url(),
            },
            {
              name: 'Floor Lamps',
              image: faker.image.url(),
            },
          ],
        },
        {
          name: 'Laptops',
          image: faker.image.url(),
          children: [
            {
              name: 'Mac Books',
              image: faker.image.url(),
            },
            {
              name: 'Lenovo',
              image: faker.image.url(),
            },
          ],
        },
      ],
    },
    {
      name: 'Watches And Accessories',
      image: faker.image.url(),
      parent: null,
      children: [
        {
          name: `Men's Watches`,
          image: faker.image.url(),

          children: [
            {
              name: 'Business',
              image: faker.image.url(),
            },
            {
              name: 'Fashion',
              image: faker.image.url(),
            },
          ],
        },
        {
          name: `Women's Watches`,
          image: faker.image.url(),
          children: [
            {
              name: 'Fashion',
              image: faker.image.url(),
            },
            {
              name: 'Business',
              image: faker.image.url(),
            },
          ],
        },
      ],
    },
  ];
}

// function findMethod(methodName: string) {
//   const seed = {
//     user: generateUsers,
//     product: generateProduct,
//     productMeta: generateProductMeta,
//     category: generateCategories,
//     schoolDiscount: generateSchoolDiscount,
//   };

//   return seed[methodName];
// }

export const data = faker.helpers.multiple(generateProduct, {
  count: 2,
});

// (() => {
//   const method = process.argv;
//   for (let i = 2; i < method.length; i++) {
//     console.log(faker.helpers.multiple(findMethod(method[i])));
//   }
// })();
// console.log(data[0].productMetas);
