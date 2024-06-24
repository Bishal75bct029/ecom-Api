import * as dotenv from 'dotenv';
import { cleanEnv, num, port, str } from 'envalid';

dotenv.config();

export const envConfig = cleanEnv(process.env, {
  DB_NAME: str(),
  DB_HOST: str(),
  DB_PORT: port(),
  DB_USER: str(),
  DB_PASSWORD: str(),
  NODE_ENV: str({ default: 'local', choices: ['local', 'development', 'staging', 'production'] }),
  PORT: port({ default: 3000 }),

  JWT_SECRET: str(),
  JWT_ISSUER: str(),
  JWT_AUDIENCE: str(),
  JWT_TTL: num(),
  JWT_REFRESH_TOKEN_TTL: num(),

  REDIS_URL: str(),
  REDIS_PREFIX: str(),
});
