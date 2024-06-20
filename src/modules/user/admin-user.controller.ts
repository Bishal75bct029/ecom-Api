import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateAdminUserDto, LoginAdminUserDto } from './dto/create-user.dto';
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

  @Post('login')
  async loaginAdmin(@Body() loginAdminUserDto: LoginAdminUserDto) {
    const user = await this.userService.findOne({ where: { email: loginAdminUserDto.email } });

    if (!user) throw new BadRequestException('Invalid Credentials');

    if (!(await bcrypt.compare(loginAdminUserDto.password, user.password)))
      throw new BadRequestException('Invalid Credentials');
    
    return loginAdminUserDto;
  }
}
