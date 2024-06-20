import { Controller, Post, Body } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateAdminUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { UserRoleEnum } from './entities/user.entity';
@Controller('admin/users')
export class AdminUserController {
  constructor(private readonly userService: UserService) {}

  @Post('create')
  async createAdmin(@Body() createAdminUserDto: CreateAdminUserDto) {
    createAdminUserDto.password = await bcrypt.hash(createAdminUserDto.password, 10);

    const user = await this.userService.createAndSave({ ...createAdminUserDto, role: UserRoleEnum.ADMIN });
    delete user.password;

    return user;
  }
}
