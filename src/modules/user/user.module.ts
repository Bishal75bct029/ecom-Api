import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiUserController } from './api-user.controller';
import { AdminUserController } from './admin-user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { CategoryEntity } from '../category/entities/category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, CategoryEntity])],
  controllers: [ApiUserController, AdminUserController],
  providers: [UserService],
})
export class UserModule {}
