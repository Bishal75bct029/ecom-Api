import { DataSource, DataSourceOptions } from 'typeorm';
import { envConfig } from './envConfig';
import { join } from 'path';
import { runSeeders, SeederOptions } from 'typeorm-extension';
import { UserEntity } from '@/modules/user/entities';
import { CreateAdminUserDto } from '@/modules/user/dto';
import { faker } from '@faker-js/faker';

export const TYPEORM_CONFIG = {
  type: 'postgres',
  host: envConfig.DB_HOST,
  port: envConfig.DB_PORT,
  username: envConfig.DB_USER,
  password: envConfig.DB_PASSWORD,
  database: envConfig.DB_NAME,
  entities: [join(__dirname, '../**/*.entity{.ts,.js}')],
  migrations: [join(__dirname, '../migrations/*{.ts,.js}')],
  migrationsTableName: 'migrations',
  synchronize: envConfig.NODE_ENV === 'local',
  logging: envConfig.NODE_ENV === 'local',
} as DataSourceOptions;

const dataSource = new DataSource(TYPEORM_CONFIG);

export function generateUsers(): CreateAdminUserDto {
  return {
    email: faker.internet.email(),
    password: faker.internet.password(),
    name: faker.internet.userName(),
    isOtpEnabled: faker.datatype.boolean(),
  };
}

const user = dataSource.getRepository(UserEntity);
user.save(generateUsers());

export default new DataSource(TYPEORM_CONFIG);
