import { Controller, Post, Body, Res, Req, BadRequestException, Put, Param, Get } from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { UserService } from '../services/user.service';
import { CreateUserDto, LoginUserDto } from '../dto/create-user.dto';
import { CreateAddressDto } from '../dto/address.dto';
import { AddressService } from '../services/address.service';
import { UserRoleEnum } from '../entities/user.entity';
import { envConfig } from '@/configs/envConfig';

@ApiTags('API User')
@Controller('api/users')
export class ApiUserController {
  constructor(
    private readonly userService: UserService,
    private readonly addressService: AddressService,
  ) {}

  @Post('create')
  async createUser(@Body() createUserDto: CreateUserDto) {
    console.log(createUserDto);
    return this.userService.createAndSave({ ...createUserDto, role: UserRoleEnum.USER });
  }

  @Post('login')
  async loginAdmin(@Body() loginUserDto: LoginUserDto, @Res() res: Response) {
    const { id, role } = await this.userService.login({ ...loginUserDto, role: UserRoleEnum.USER });

    const payload: UserJwtPayload = { id, role };
    const [token, refreshToken] = await this.userService.generateJWTs(payload);

    res.cookie('x-auth-cookie', token, {
      httpOnly: true,
      maxAge: envConfig.JWT_TTL * 1000,
      secure: true,
      sameSite: 'strict',
    });
    res.cookie('x-refresh-cookie', refreshToken, {
      httpOnly: true,
      maxAge: envConfig.JWT_REFRESH_TOKEN_TTL * 1000,
      secure: true,
      sameSite: 'strict',
    });

    return res.send();
  }

  @Post('address')
  async createAddress(@Body() createAddressDto: CreateAddressDto, @Req() { currentUser }: Request) {
    const user = await this.userService.findOne({ where: { id: currentUser.id } });

    if (!user) throw new BadRequestException("User doesn't exists");

    return this.addressService.createAndSave({ ...createAddressDto, user });
  }

  @Put('address/:id')
  async updateAddress(@Body() createAddressDto: CreateAddressDto, @Param('id') id: string) {
    const address = await this.addressService.findOne({ where: { id } });

    if (!address) throw new BadRequestException("Address doesn't exists");

    return this.addressService.createAndSave({ ...address, ...createAddressDto });
  }

  @Get('address')
  async getMyAddress(@Req() req: Request) {
    const addresses = await this.addressService.find({
      where: {
        user: {
          id: req.currentUser.id,
        },
      },
      select: ['id', 'contact', 'name', 'type'],
    });

    return addresses;
  }
}
