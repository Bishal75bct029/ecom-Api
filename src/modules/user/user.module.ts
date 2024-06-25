import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity, AddressEntity } from './entities';
import { ApiUserController, AdminUserController } from './controllers';
import { UserService, AddressService } from './services';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, AddressEntity])],
  controllers: [ApiUserController, AdminUserController],
  providers: [UserService, AddressService],
  exports: [UserService],
})
export class UserModule {}
