import { DataSource, DataSourceOptions } from 'typeorm';
import { envConfig } from './envConfig';
import { join } from 'path';

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
  synchronize: true,
  logging: true,
} as unknown as DataSourceOptions;

export default new DataSource(TYPEORM_CONFIG);
