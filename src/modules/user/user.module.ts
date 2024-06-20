import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiUserController } from './api-user.controller';
import { AdminUserController } from './admin-user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  controllers: [ApiUserController, AdminUserController],
  providers: [UserService],
})
export class UserModule {}
