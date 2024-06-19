// abstract.service.ts
import { Injectable } from '@nestjs/common';
import { Repository, DeepPartial, FindManyOptions, FindOneOptions, FindOptionsWhere } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

@Injectable()
export abstract class AbstractService<T> {
  constructor(private readonly repository: Repository<T>) {}

  async findOne(findOneOptions: FindOneOptions<T>) {
    return this.repository.findOne(findOneOptions);
  }

  async find(findManyOptions: FindManyOptions<T> = {}) {
    return this.repository.find(findManyOptions);
  }
  async create(newData: DeepPartial<T>) {
    const newEntity = this.repository.create(newData);
    return this.repository.save(newEntity);
  }

  async update(findOption: FindOptionsWhere<T>, partialEntity: QueryDeepPartialEntity<T>) {
    return this.repository.update(findOption, partialEntity);
  }
}
