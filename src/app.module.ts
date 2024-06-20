import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { ProductModule } from '@/modules/product/product.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TYPEORM_CONFIG } from '@/configs/typeorm';
import { CategoryModule } from './modules/category/category.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TransformResponseInterceptor } from './common/interceptors/transform-response.interceptor';
import { AdminMiddleware } from './common/middlewares/admin/admin.middleware';
import { ApiMiddleware } from './common/middlewares/api/api.middleware';
import { ReviewModule } from './modules/review/review.module';
import { UserModule } from './modules/user/user.module';
import { CartModule } from './modules/cart/cart.module';
import { OrderModule } from './modules/order/order.module';

@Module({
  imports: [
    ProductModule,
    TypeOrmModule.forRoot({
      ...TYPEORM_CONFIG,
      retryAttempts: 5,
    }),
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
      .exclude('admin/users/login')
      .forRoutes({ path: 'admin/*', method: RequestMethod.ALL });
    consumer.apply(ApiMiddleware).forRoutes({ path: 'api/*', method: RequestMethod.ALL });
  }
}
