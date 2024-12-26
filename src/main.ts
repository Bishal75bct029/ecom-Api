import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import * as session from 'express-session';
import { RedisStore } from 'connect-redis';
import { Redis } from 'ioredis';
import * as cookieParser from 'cookie-parser';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { AppModule } from './app.module';
import { AllExceptionFilter } from './common/filters';
import { envConfig } from './configs/envConfig';
import { swaggerSetup } from './configs/swagger';
import { transformAllRoutes } from './common/utils';
import { type UserEntity } from './modules/user/entities';
import { SESSION_COOKIE_NAME } from './app.constants';
import { NestExpressApplication } from '@nestjs/platform-express';

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
  process.env.NODE_ENV = 'production';
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.set('trust proxy', 1);
  // For cross origin resource sharing
  app.enableCors({
    origin: function (origin, callback) {
      console.log(origin);
      // if (!origin || envConfig.NODE_ENV === 'local' || JSON.parse(envConfig.ALLOWED_ORIGINS).indexOf(origin) !== -1) {
      //   callback(null, true);
      // } else {
      //   callback(new Error('Not allowed by CORS.'));
      // }
      callback(null, true);
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

  app.use(
    session({
      store: redisStore,
      secret: envConfig.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        path: '/',
        maxAge: 86400 * 1000,
        secure: true, // Ensure cookies are sent over HTTPS only
        sameSite: 'none', // Helps mitigate CSRF attacks
        domain: '.innovatetech.io',
        // maxAge: 1000 * 60 * 60 * 24, // 1-day cookie expiration
      },
      name: SESSION_COOKIE_NAME,
    }),
  );

  app.use((req: Request, res: Response, next: NextFunction) => {
    res.set('Access-Control-Expose-Headers', 'Set-Cookie');
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
