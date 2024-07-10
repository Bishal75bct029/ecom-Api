import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TYPEORM_CONFIG } from '@/configs/typeorm';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { TransformResponseInterceptor } from './common/interceptors';
import { AdminMiddleware, ApiMiddleware } from './common/middlewares';
import { ProductModule, CategoryModule, ReviewModule, UserModule, CartModule, OrderModule } from '@/modules';
import { RedisModule } from './libs/redis/redis.module';
import { ADMIN_PUBLIC_ROUTES, API_PUBLIC_ROUTES } from './app.constants';
import { DiscountModule } from './modules/discount/discount.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({ ...TYPEORM_CONFIG, retryAttempts: 5 }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
    JwtModule.register({ global: true }),
    RedisModule,
    ProductModule,
    CategoryModule,
    ReviewModule,
    UserModule,
    CartModule,
    OrderModule,
    DiscountModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformResponseInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AdminMiddleware)
      .exclude(...ADMIN_PUBLIC_ROUTES)
      .forRoutes({ path: 'admin/*', method: RequestMethod.ALL });
    consumer
      .apply(ApiMiddleware)
      .exclude(...API_PUBLIC_ROUTES)
      .forRoutes({ path: 'api/*', method: RequestMethod.ALL });
  }
}
