import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AllExceptionFilter } from './common/filters/exception.filter';
import { envConfig } from './configs/envConfig';
import { swaggerSetup } from './configs/swagger';

(async () => {
  const app = await NestFactory.create(AppModule);
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
  await app.listen(envConfig.PORT, () => Logger.log(`Listening on port ${envConfig.PORT}`));
})();
