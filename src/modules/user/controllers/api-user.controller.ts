import { Controller, Post, Body, Req, BadRequestException, Put, Param, Get, HttpCode } from '@nestjs/common';
import { Request } from 'express';
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
    return this.userService.createAndSave({ ...createUserDto, role: UserRoleEnum.USER });
  }

  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto) {
    const { id, role, schoolId } = await this.userService.login({ ...loginUserDto, role: UserRoleEnum.USER });

    const payload: UserJwtPayload = { id, role, schoolId };
    const [token, refreshToken] = await this.userService.generateJWTs(payload);

    return { token, refreshToken };
  }

  @Post('refresh')
  @HttpCode(200)
  async refresh(@Body('refreshToken') refreshToken: string) {
    const [token, generatedRefreshToken] = await this.userService.refreshUser(refreshToken, {
      secret: envConfig.API_JWT_SECRET,
      issuer: envConfig.API_JWT_ISSUER,
      audience: envConfig.API_JWT_AUDIENCE,
    });
    return { token, refreshToken: generatedRefreshToken };
  }

  @Get('address')
  async getUserAddresses(@Req() { currentUser }: Request) {
    return this.addressService.find({ where: { user: { id: currentUser.id } } });
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
        cart: {
          productMetaId: true,
        },
      },
      relations: ['addresses', 'cart'],
    });

    return user;
  }
}
