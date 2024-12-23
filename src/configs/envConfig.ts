import 'dotenv/config';
import { cleanEnv, port, str, url } from 'envalid';

export const envConfig = cleanEnv(process.env, {
  DB_NAME: str(),
  DB_HOST: str(),
  DB_PORT: port(),
  DB_USER: str(),
  DB_PASSWORD: str(),
  NODE_ENV: str({ default: 'local', choices: ['local', 'development', 'staging', 'production'] }),
  PORT: port({ default: 3000 }),

  USER_INTERACTION_BASE_URL: str(),

  PASETO_JWT_SECRET: str(),
  SESSION_SECRET: str(),

  REDIS_PORT: port(),
  REDIS_HOST: str(),
  REDIS_PREFIX: str(),

  AWS_ACCESS_KEY_ID: str(),
  AWS_SECRET_ACCESS_KEY: str(),
  EMAIL_SQS_URL: str(),
  AWS_REGION: str(),
  AWS_BUCKET: str(),

  ALLOWED_ORIGINS: str(),

  PAYPAL_CLIENT_ID: str(),
  PAYPAL_CLIENT_SECRET: str(),
  PAYPAL_RETURN_URL: url(),
  PAYPAL_CANCEL_URL: url(),
  PAYPAL_REDIRECTION_URL: url(),

  STRIPE_PK: str(),
  STRIPE_SK: str(),
  STRIPE_WEBHOOK_ENDPOINT_SECRET: str(),
});
