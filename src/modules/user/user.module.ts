import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity, AddressEntity } from './entities';
import { ApiUserController, AdminUserController } from './controllers';
import { UserService, AddressService } from './services';
import { AWSModule } from '@/common/module/aws/aws.module';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, AddressEntity]), AWSModule],
  controllers: [ApiUserController, AdminUserController],
  providers: [UserService, AddressService],
  exports: [UserService],
})
export class UserModule {}
