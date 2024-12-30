import { NestFactory } from '@nestjs/core';
import { RedisStore } from 'connect-redis';
import { Redis } from 'ioredis';
import * as cookieParser from 'cookie-parser';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import { NestExpressApplication } from '@nestjs/platform-express';

import { AppModule } from './app.module';
import { AllExceptionFilter } from './common/filters';
import { envConfig } from './configs/envConfig';
import { swaggerSetup } from './configs/swagger';
import { transformAllRoutes } from './common/utils';
import { type UserEntity } from './modules/user/entities';
import * as session from 'express-session';
import { sessionConfig } from './configs/sessionConfig';

declare global {
  interface BigInt {
    toJSON(): number;
  }
}

declare module 'express-session' {
  interface SessionData {
    user: Pick<UserEntity, 'id' | 'name' | 'image' | 'role' | 'email' | 'schoolId' | 'isOtpEnabled'>;
  }
}

BigInt.prototype.toJSON = function () {
  return Number(this);
};

(async () => {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.set('trust proxy', true);

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

  // For Content Security Policy
  app.use(helmet());

  // ----------------- Start For Manging Server Session -------------------------
  const redisClient = new Redis({
    host: envConfig.REDIS_HOST,
    port: envConfig.REDIS_PORT,
  });

  const redisStore = new RedisStore({
    client: redisClient,
    prefix: `${envConfig.REDIS_PREFIX}:sess:`,
  });

  app.use((req: Request, _res: Response, next: NextFunction) => {
    if (
      (req.protocol === 'https' || JSON.parse(envConfig.ALLOWED_ORIGINS).includes(req.headers?.origin)) &&
      envConfig.NODE_ENV !== 'local'
    ) {
      req.headers['x-forwarded-proto'] = 'https';
      sessionConfig.cookie.secure = true;
      sessionConfig.cookie.domain = envConfig.SESSION_DOMAIN;
    } else {
      sessionConfig.cookie.secure = false;
    }
    next();
  });

  sessionConfig.store = redisStore;
  app.use(session(sessionConfig));

  app.use((req: Request, _res: Response, next: NextFunction) => {
    if (req.session) req.session.touch();
    next();
  });

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
