import { DataSource } from 'typeorm';
import { runSeeders, Seeder, SeederFactoryManager } from 'typeorm-extension';

import { CreateAdminUserDto } from '@/modules/user/dto';
import { faker } from '@faker-js/faker';
import UserSeeder from './category.seed';

export function generateUsers(): CreateAdminUserDto {
  return {
    email: faker.internet.email(),
    password: faker.internet.password(),
    name: faker.internet.userName(),
    isOtpEnabled: faker.datatype.boolean(),
  };
}

export default class InitSeeder implements Seeder {
  public async run(dataSource: DataSource, factoryManager: SeederFactoryManager): Promise<any> {
    await runSeeders(dataSource, {
      seeds: [UserSeeder],
    });
  }
}
