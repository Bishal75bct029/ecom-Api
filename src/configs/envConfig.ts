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

  ADMIN_JWT_SECRET: str(),
  ADMIN_JWT_ISSUER: str(),
  ADMIN_JWT_AUDIENCE: str(),
  JWT_TTL: num(),
  JWT_REFRESH_TOKEN_TTL: num(),

  API_JWT_SECRET: str(),
  API_JWT_ISSUER: str(),
  API_JWT_AUDIENCE: str(),

  REDIS_URL: str(),
  REDIS_PREFIX: str(),

  AWS_ACCESS_KEY_ID: str(),
  AWS_SECRET_ACCESS_KEY: str(),
  EMAIL_SQS_URL: str(),
  AWS_REGION: str(),
});
