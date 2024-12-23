import {
  Controller,
  Post,
  Body,
  Req,
  BadRequestException,
  Put,
  Param,
  Get,
  HttpCode,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { UserService } from '../services/user.service';
import { LoginUserDto } from '../dto/create-user.dto';
import { CreateAddressDto } from '../dto/address.dto';
import { AddressService } from '../services/address.service';
import { UserRoleEnum } from '../entities/user.entity';
import { envConfig } from '@/configs/envConfig';
import { ValidateIDDto } from '@/common/dtos';

@ApiTags('API User')
@Controller('api/users')
export class ApiUserController {
  constructor(
    private readonly userService: UserService,
    private readonly addressService: AddressService,
  ) {}

  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto, @Req() req: Request) {
    const user = await this.userService.findOne({ where: { email: loginUserDto.email, role: UserRoleEnum.USER } });
    if (!user) throw new BadRequestException("User doesn't exists");

    if (!this.userService.comparePassword(loginUserDto.password, user.password))
      throw new BadRequestException('User failed to login.');

    req.session.user = user;

    return { message: 'logged in successfully' };
  }

  @Get('profile')
  profile(@Req() req: Request) {
    const user = req.session.user; // Access session data
    if (!user) {
      return { message: 'Not logged in!' };
    }
    return user;
  }

  @Get('logout')
  logout(@Req() req: Request) {
    req.session.destroy((err) => {
      if (err) {
        throw new Error('Logout failed');
      }
    });
    return { message: 'Logged out successfully!' };
  }

  @Post('refresh')
  @HttpCode(200)
  async refresh(@Body('refreshToken') refreshToken: string) {
    try {
      const [token, generatedRefreshToken] = await this.userService.refreshUser(refreshToken, {
        secret: envConfig.API_JWT_SECRET,
        issuer: envConfig.API_JWT_ISSUER,
        audience: envConfig.API_JWT_AUDIENCE,
      });
      return { token, refreshToken: generatedRefreshToken };
    } catch (error) {
      throw new ForbiddenException({ message: 'Session expired. Please re-login.', needsLogin: true });
    }
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
  async updateAddress(@Body() createAddressDto: CreateAddressDto, @Param() { id }: ValidateIDDto) {
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
          cartItems: true,
        },
      },
      relations: ['addresses', 'cart'],
    });

    return user;
  }
}
