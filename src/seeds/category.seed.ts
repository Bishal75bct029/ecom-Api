import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { UserEntity, UserRoleEnum } from '@/modules/user/entities';

export default class UserSeeder implements Seeder {
  public async run(dataSource: DataSource, factoryManager: SeederFactoryManager): Promise<void> {
    const repository = dataSource.getRepository(UserEntity);
    repository.create({
      name: 'BishalLamichhane',
      email: 'bishallamichhane123@mail.com',
      isOtpEnabled: false,
      role: UserRoleEnum.USER,
      password: 'password',
    });
  }
}
