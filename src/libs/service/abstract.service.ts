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

  async createAndSave(newData: DeepPartial<T>) {
    const newEntity = this.repository.create(newData);
    return this.repository.save(newEntity);
  }

  create(newData: DeepPartial<T>) {
    return this.repository.create(newData);
  }

  createMany(newData: DeepPartial<T>[]) {
    return this.repository.create(newData);
  }

  async update(findOption: FindOptionsWhere<T>, partialEntity: QueryDeepPartialEntity<T>) {
    return this.repository.update(findOption, partialEntity);
  }

  async delete(findOption: FindOptionsWhere<T>) {
    return this.repository.delete(findOption);
  }

  async softDelete(findOption: FindOptionsWhere<T>) {
    return this.repository.softDelete(findOption);
  }

  async save(newEntity: T) {
    return this.repository.save(newEntity);
  }

  async saveMany(newEntities: T[]) {
    return this.repository.save(newEntities);
  }
}
