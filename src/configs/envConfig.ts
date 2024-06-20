import * as dotenv from 'dotenv';
import { cleanEnv, port, str } from 'envalid';

dotenv.config();

export const envConfig = cleanEnv(process.env, {
  DB_NAME: str(),
  DB_HOST: str(),
  DB_PORT: port(),
  DB_USER: str(),
  DB_PASSWORD: str(),
  NODE_ENV: str({ default: 'local', choices: ['local', 'development', 'staging', 'production'] }),
  PORT: port({ default: 3000 }),
});
