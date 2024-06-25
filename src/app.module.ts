import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TYPEORM_CONFIG } from '@/configs/typeorm';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { AppController } from './app.controller';
import { TransformResponseInterceptor } from './common/interceptors';
import { AdminMiddleware, ApiMiddleware } from './common/middlewares';
import { ProductModule, CategoryModule, ReviewModule, UserModule, CartModule, OrderModule } from '@/modules';
import { RedisModule } from './libs/redis/redis.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({ ...TYPEORM_CONFIG, retryAttempts: 5 }),
    JwtModule.register({ global: true }),
    RedisModule,
    ProductModule,
    CategoryModule,
    ReviewModule,
    UserModule,
    CartModule,
    OrderModule,
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
      .exclude('admin/users/login', 'admin/users/create', 'admin/users/logout', 'admin/users/refresh')
      .forRoutes({ path: 'admin/*', method: RequestMethod.ALL });
    consumer
      .apply(ApiMiddleware)
      .exclude('api/users/login', 'api/users/create', 'api/users/logout', 'api/users/refresh')
      .forRoutes({ path: 'api/*', method: RequestMethod.ALL });
  }
}
