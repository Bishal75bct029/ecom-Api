import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { AllExceptionFilter } from './common/filters';
import { envConfig } from './configs/envConfig';
import { swaggerSetup } from './configs/swagger';
import { writeFileSync } from 'fs';
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
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  app.useGlobalFilters(new AllExceptionFilter(new Logger()));
  swaggerSetup(app);
  await app.listen(envConfig.PORT, () => {
    const server = app.getHttpServer();
    const router = server._events.request._router; // Access the router

    const routes = [];
    router.stack.forEach((layer: any) => {
      if (layer.route) {
        const route = layer.route;
        const path = route?.path;
        if (
          (path.startsWith('/admin') || path.startsWith('/api')) &&
          ['get', 'post', 'put', 'patch', 'delete'].includes(route.stack[0].method)
        ) {
          routes.push({
            method: route.stack[0].method.toUpperCase(),
            path,
          });
        }
      }
    });
    writeFileSync('./dist/routes.json', JSON.stringify(routes));
    Logger.log(`Listening on port ${envConfig.PORT}`);
  });
})();
