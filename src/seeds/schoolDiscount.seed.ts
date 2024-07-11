import { faker } from '@faker-js/faker';
import { CreateSchoolDiscountDto } from '../modules/school-discount/dtos/create-schoolDiscount.dto';
import dataSource from '../configs/typeorm';
import { SchoolDiscountEntity } from '../modules/school-discount/entities/schoolDiscount.entity';
import { envConfig } from '../configs/envConfig';

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

console.log(envConfig.DB_HOST);
(async () => {
  try {
    console.log('checking');
    console.log(envConfig);
    await dataSource.initialize();
    const productRepository = dataSource.getRepository(SchoolDiscountEntity);
    productRepository.create(generateSchoolDiscount());
    console.log(productRepository);
    dataSource.destroy();
  } catch (e) {
    console.log(e, 'error occured ...');
  }
})();
