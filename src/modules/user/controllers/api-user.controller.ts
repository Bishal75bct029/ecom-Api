import {
  Controller,
  Post,
  Body,
  Req,
  BadRequestException,
  Put,
  Param,
  Get,
  Res,
  InternalServerErrorException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { UserService } from '../services/user.service';
import { LoginUserDto } from '../dto/create-user.dto';
import { CreateAddressDto } from '../dto/address.dto';
import { AddressService } from '../services/address.service';
import { UserRoleEnum } from '../entities/user.entity';
import { ValidateIDDto } from '@/common/dtos';
import { SESSION_COOKIE_NAME } from '@/app.constants';

@ApiTags('API User')
@Controller('api/users')
export class ApiUserController {
  constructor(
    private readonly userService: UserService,
    private readonly addressService: AddressService,
  ) {}

  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto, @Req() req: Request) {
    const user = await this.userService.findOne({
      where: { email: loginUserDto.email, role: UserRoleEnum.USER },
      select: ['id', 'name', 'image', 'role', 'email', 'schoolId', 'isOtpEnabled', 'password'],
    });
    if (!user) throw new BadRequestException("User doesn't exist.");

    if (!this.userService.comparePassword(loginUserDto.password, user.password))
      throw new BadRequestException('User failed to login.');

    delete user.password;
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
  logout(@Req() req: Request, @Res() res: Response) {
    req.session.destroy((err) => {
      if (err) {
        throw new InternalServerErrorException('Logout failed.');
      }
    });
    res.clearCookie(SESSION_COOKIE_NAME);
    res.send({ message: 'Logged out successfully.' });
  }

  @Get('address')
  async getUserAddresses(@Req() { session: { user } }: Request) {
    return this.addressService.find({ where: { user: { id: user.id } } });
  }

  @Post('address')
  async createAddress(@Body() createAddressDto: CreateAddressDto, @Req() { session: { user: currentUser } }: Request) {
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
  async whoami(@Req() { session }: Request) {
    return { user: session?.user };
  }
}
