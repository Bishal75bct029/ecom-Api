import { Controller, Post, Body, Res, Req } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateAdminUserDto, LoginUserDto } from './dto/create-user.dto';
import { UserRoleEnum } from './entities/user.entity';

@ApiTags('Admin User')
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
  async loginAdmin(@Body() loginUserDto: LoginUserDto, @Res() res: Response) {
    return this.userService.login(loginUserDto, res, UserRoleEnum.ADMIN);
  }

  @Post('logout')
  async logoutAdmin(@Res() res: Response) {
    return this.userService.logout(res);
  }

  @Post('refresh')
  async refreshAdmin(@Req() req: Request, @Res() res: Response) {
    return this.userService.refresh(req, res, UserRoleEnum.ADMIN);
  }
}
