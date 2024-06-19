import { Injectable } from '@nestjs/common';
import { AbstractService } from '@/libs/service/abstract.service';
import { UserEntity } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UserService extends AbstractService<UserEntity> {
  constructor(@InjectRepository(UserEntity) private readonly itemRepository: Repository<UserEntity>) {
    super(itemRepository);
  }
}
