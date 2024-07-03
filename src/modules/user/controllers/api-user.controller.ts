import { Controller, Post, Body, Res, Req, BadRequestException, Put, Param, Get } from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { UserService } from '../services/user.service';
import { CreateUserDto, LoginUserDto } from '../dto/create-user.dto';
import { CreateAddressDto } from '../dto/address.dto';
import { AddressService } from '../services/address.service';
import { UserRoleEnum } from '../entities/user.entity';
import bcrypt from 'bcrypt';
import { envConfig } from '@/configs/envConfig';

@ApiTags('API User')
@Controller('api/users')
export class ApiUserController {
  constructor(
    private readonly userService: UserService,
    private readonly addressService: AddressService,
  ) {}

  @Post()
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Post('login')
  async loginAdmin(@Body() loginUserDto: LoginUserDto, @Res() res: Response) {
    const user = await this.userService.findOne({ where: { email: loginUserDto.email } });
    if (!user) throw new BadRequestException('Invalid Credentials');

    if (user.role !== UserRoleEnum.USER) throw new BadRequestException('Invalid Credentials');

    if (!(await bcrypt.compare(loginUserDto.password, user.password)))
      throw new BadRequestException('Invalid Credentials');

    const payload: UserJwtPayload = { id: user.id, role: user.role };
    const [token, refreshToken] = await this.userService.generateJWTs(payload, user.role);

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

    // return this.userService.login(loginUserDto, res, UserRoleEnum.USER);
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
  async getAllAddress() {
    return this.addressService.find();
  }
}
