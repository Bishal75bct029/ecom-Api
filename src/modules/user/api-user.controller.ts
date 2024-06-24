import { Controller, Post, Body, Res, Req } from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto, LoginUserDto } from './dto/create-user.dto';

@ApiTags('API User')
@Controller('api/users')
export class ApiUserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Post('login')
  async loginAdmin(@Body() loginUserDto: LoginUserDto, @Res() res: Response) {
    return this.userService.login(loginUserDto, res);
  }

  @Post('logout')
  async logoutAdmin(@Res() res: Response) {
    return this.userService.logout(res);
  }

  @Post('refresh')
  async refreshAdmin(@Req() req: Request, @Res() res: Response) {
    return this.userService.refresh(req, res);
  }
}
