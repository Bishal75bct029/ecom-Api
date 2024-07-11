import { CreateAdminUserDto } from '@/modules/user/dto';
import { faker } from '@faker-js/faker';
import dataSource from '../configs/typeorm';
import { UserEntity } from '@/modules/user/entities';

export function generateUsers(): CreateAdminUserDto {
  return {
    email: faker.internet.email(),
    password: faker.internet.password(),
    name: faker.internet.userName(),
    isOtpEnabled: faker.datatype.boolean(),
  };
}

(async () => {
  try {
    console.log('Seeding User data started...');
    await dataSource.initialize();
    const productRepository = dataSource.getRepository(UserEntity);
    productRepository.create(generateUsers());
    console.log('User seeded successfully');
    dataSource.destroy();
  } catch (e) {
    console.log(e, 'error occured ...');
  }
})();
