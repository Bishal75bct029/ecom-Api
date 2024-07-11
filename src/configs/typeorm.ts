import { DataSource, DataSourceOptions } from 'typeorm';
import { envConfig } from './envConfig';
import { join } from 'path';
import { runSeeders, SeederOptions } from 'typeorm-extension';
import UserSeeder from '@/seeds/category.seed';
import MainSeeder from '@/seeds/user.factory';
import { UsersFactory } from '@/seeds/productMeta.seed';

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
  seeds: [MainSeeder],
  // factories:[UsersFactory]
} as DataSourceOptions & SeederOptions;

const dataSource = new DataSource(TYPEORM_CONFIG);

dataSource.initialize().then(async () => {
  await dataSource.synchronize(true);
  await runSeeders(dataSource);
  process.exit();
});

export default new DataSource(TYPEORM_CONFIG);
