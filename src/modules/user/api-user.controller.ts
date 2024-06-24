import { Controller, Post, Body, Res, Req, BadRequestException } from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto, LoginUserDto } from './dto/create-user.dto';
import { CreateAddressDto } from './dto/address.dto';

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

  @Post('create-address')
  async createAddress(@Body() createAddressDto: CreateAddressDto, @Req() req: Request) {
    const { id } = req.currentUser;

    const user = await this.userService.findOne({ where: { id } });

    if (!user) throw new BadRequestException("User doesn't exists");
  }
}
