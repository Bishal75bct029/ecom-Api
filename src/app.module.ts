import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TYPEORM_CONFIG } from '@/configs/typeorm';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { AppController } from './app.controller';
import { ProductModule } from '@/modules/product/product.module';
import { CategoryModule } from './modules/category/category.module';
import { TransformResponseInterceptor } from './common/interceptors/transform-response.interceptor';
import { AdminMiddleware } from './common/middlewares/admin/admin.middleware';
import { ApiMiddleware } from './common/middlewares/api/api.middleware';
import { ReviewModule } from './modules/review/review.module';
import { UserModule } from './modules/user/user.module';
import { CartModule } from './modules/cart/cart.module';
import { OrderModule } from './modules/order/order.module';
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
