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
      maxAge: envConfig.JWT_REFRESH_TOKEN_TTL * 1000,
      secure: true,
      sameSite: 'strict',
    });
    res.cookie('x-refresh-cookie', refreshToken, {
      httpOnly: true,
      maxAge: envConfig.JWT_REFRESH_TOKEN_TTL * 1000,
      secure: true,
      sameSite: 'strict',
    });

    return res.status(200).send();
  }

  @Post('refresh')
  async refresh(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies['x-refresh-cookie'];
    const [token, generatedRefreshToken] = await this.userService.refreshUser(refreshToken, {
      secret: envConfig.API_JWT_SECRET,
      issuer: envConfig.API_JWT_ISSUER,
      audience: envConfig.API_JWT_AUDIENCE,
    });

    res.cookie('x-auth-cookie', token, {
      httpOnly: true,
      maxAge: envConfig.JWT_REFRESH_TOKEN_TTL * 1000,
      secure: true,
      sameSite: 'strict',
    });
    res.cookie('x-refresh-cookie', generatedRefreshToken, {
      httpOnly: true,
      maxAge: envConfig.JWT_REFRESH_TOKEN_TTL * 1000,
      secure: true,
      sameSite: 'strict',
    });

    return res.status(200).send();
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

  @Get('whoami')
  async whoami(@Req() { currentUser }: Request) {
    if (!currentUser.id) throw new BadRequestException('User is not loggedin.');
    const user = await this.userService.findOne({
      where: {
        id: currentUser.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        addresses: {
          name: true,
          type: true,
          contact: true,
        },
      },
      relations: ['addresses'],
    });

    return user;
  }
}
