import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TYPEORM_CONFIG } from '@/configs/typeorm';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { TransformResponseInterceptor } from './common/interceptors';
import { AdminMiddleware, ApiMiddleware, PermissionMiddleware } from './common/middlewares';
import { ProductModule, CategoryModule, ReviewModule, UserModule, CartModule, OrderModule } from '@/modules';
import { RedisModule } from './libs/redis/redis.module';
import { ADMIN_PUBLIC_ROUTES, API_PUBLIC_ROUTES } from './app.constants';
import { ApiAuthorizationMiddleware } from './common/middlewares/api/api-authorization.middleware';
import { PaymentMethodModule } from './modules/payment-method/payment-method.module';
import { TransactionModule } from './modules/transaction/transaction.module';
import { HttpsModule } from './libs/https/https.module';
import { PasetoJwtModule } from './libs/pasetoJwt/pasetoJwt.module';
import { RbacModule } from './modules/RBAC/rbac.module';
import { SchoolDiscountModule } from './modules/school-discount/school-discount.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({ ...TYPEORM_CONFIG, retryAttempts: 5 }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
    RedisModule,
    ProductModule,
    CategoryModule,
    ReviewModule,
    UserModule,
    CartModule,
    OrderModule,
    SchoolDiscountModule,
    PaymentMethodModule,
    TransactionModule,
    HttpsModule,
    PasetoJwtModule,
    RbacModule,
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
      .apply(AdminMiddleware, PermissionMiddleware)
      .exclude(...ADMIN_PUBLIC_ROUTES)
      .forRoutes({ path: 'admin/*', method: RequestMethod.ALL });
    consumer
      .apply(ApiMiddleware, PermissionMiddleware)
      .exclude(...API_PUBLIC_ROUTES)
      .forRoutes({ path: 'api/*', method: RequestMethod.ALL });
    consumer.apply(ApiAuthorizationMiddleware).forRoutes(...['api/carts', 'api/orders']);
  }
}
