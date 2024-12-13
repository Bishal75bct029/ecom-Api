import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { AllExceptionFilter } from './common/filters';
import { envConfig } from './configs/envConfig';
import { swaggerSetup } from './configs/swagger';
import { transformAllRoutes } from './common/utils';
declare global {
  interface BigInt {
    toJSON(): number;
  }
}

BigInt.prototype.toJSON = function () {
  return Number(this);
};

(async () => {
  const app = await NestFactory.create(AppModule);
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
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
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
