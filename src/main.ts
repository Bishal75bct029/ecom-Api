import { NestFactory } from '@nestjs/core';
import * as session from 'express-session';
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
import { SESSION_COOKIE_NAME } from './app.constants';

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

  app.use((req: Request, res: Response, next: NextFunction) => {
    // Dynamically set the domain based on the incoming request while checking for allowed origins
    const origin = req.headers.origin || '';
    const isAllowedOrigin = JSON.parse(envConfig.ALLOWED_ORIGINS).includes(origin);
    const domain = isAllowedOrigin ? new URL(origin).hostname : undefined;

    session({
      store: redisStore,
      secret: envConfig.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true, // Prevent client-side JavaScript from accessing the cookie
        maxAge: 86400 * 1000, // 1-day cookie expiration
        secure: true, // Use secure cookies only for non-localhost
        sameSite: 'none', // Helps mitigate CSRF attacks
        domain, // Dynamically set the domain
        path: '/',
      },
      name: SESSION_COOKIE_NAME,
    })(req, res, next);
  });

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
