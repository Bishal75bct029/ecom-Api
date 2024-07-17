import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AbstractService } from '@/libs/service/abstract.service';
import { AddressEntity } from '../entities';

@Injectable()
export class AddressService extends AbstractService<AddressEntity> {
  constructor(@InjectRepository(AddressEntity) private readonly itemRepository: Repository<AddressEntity>) {
    super(itemRepository);
  }
}
