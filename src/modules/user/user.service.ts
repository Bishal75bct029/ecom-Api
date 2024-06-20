import { Injectable } from '@nestjs/common';
import { AbstractService } from '@/libs/service/abstract.service';
import { UserEntity } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtPayload } from '@/common/middlewares/admin/admin.middleware';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService extends AbstractService<UserEntity> {
  constructor(
    @InjectRepository(UserEntity) private readonly itemRepository: Repository<UserEntity>,
    private readonly jwtService: JwtService,
  ) {
    super(itemRepository);
  }

  async generateAuthTokens(user: JwtPayload) {
    return Promise.all([
      this.jwtService.signAsync({ id: user.id, role: user.role }, { expiresIn: '2m' }),
      this.jwtService.signAsync({ id: user.id, role: user.role }, { expiresIn: '5d' }),
    ]);
  }
}
