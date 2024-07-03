import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity, AddressEntity } from './entities';
import { ApiUserController, AdminUserController } from './controllers';
import { UserService, AddressService } from './services';
import { AWSModule } from '@/common/module/aws/aws.module';
import { envConfig } from '@/configs/envConfig';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, AddressEntity]),
    AWSModule.forSQSRootAsync({
      useFactory: () => {
        return {
          accessKeyId: envConfig.AWS_ACCESS_KEY_ID,
          secretAccessKey: envConfig.AWS_SECRET_ACCESS_KEY,
          region: envConfig.AWS_REGION,
        };
      },
    }),
  ],
  controllers: [ApiUserController, AdminUserController],
  providers: [UserService, AddressService],
  exports: [UserService],
})
export class UserModule {}
