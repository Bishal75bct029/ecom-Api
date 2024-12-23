import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { AllExceptionFilter } from './common/filters';
import { envConfig } from './configs/envConfig';
import { swaggerSetup } from './configs/swagger';
import { transformAllRoutes } from './common/utils';
import helmet from 'helmet';
import * as session from 'express-session';
import { RedisStore } from 'connect-redis';
import { Redis } from 'ioredis';
import { doubleCsrf } from 'csrf-csrf';
declare global {
  interface BigInt {
    toJSON(): number;
  }
}

declare module 'express-session' {
  interface SessionData {
    user: { id: string; email: string }; // Add custom fields here
  }
}

BigInt.prototype.toJSON = function () {
  return Number(this);
};

(async () => {
  const app = await NestFactory.create(AppModule);

  // For cross origin resource sharing
  app.enableCors({
    origin: function (origin, callback) {
      if (!origin || envConfig.NODE_ENV === 'local' || JSON.parse(envConfig.ALLOWED_ORIGINS).indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS.'));
      }
    },
    credentials: true,
  });

  // For parsing cookies
  app.use(cookieParser());

  // For CSRF protection
  app.use(doubleCsrf);

  // For Content Security Policy
  app.use(helmet());

  // ----------------- Start For Manging Server Session -------------------------
  const redisClient = new Redis({
    host: envConfig.REDIS_HOST,
    port: envConfig.REDIS_PORT,
  });

  const redisStore = new RedisStore({
    client: redisClient,
    prefix: 'sess:',
  });

  app.use(
    session({
      store: redisStore,
      secret: 'get-from-env',
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 3600000,
      },
    }),
  );
  // ----------------- End For Manging Server Session -------------------------

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.useGlobalFilters(new AllExceptionFilter(new Logger()));

  swaggerSetup(app);

  await app.listen(envConfig.PORT, '0.0.0.0', () => {
    const server = app.getHttpServer();
    transformAllRoutes(server);
    Logger.log(`Listening on port ${envConfig.PORT}`);
  });
})();
