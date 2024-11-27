// abstract.service.ts
import { Injectable } from '@nestjs/common';
import {
  Repository,
  DeepPartial,
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  SaveOptions,
  ObjectId,
  RemoveOptions,
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

@Injectable()
export abstract class AbstractService<T> {
  constructor(private readonly repository: Repository<T>) {}

  create(data: DeepPartial<T>) {
    return this.repository.create(data);
  }

  createMany(data: DeepPartial<T>[]) {
    return this.repository.create(data);
  }

  async findOne(findOneOptions: FindOneOptions<T>) {
    return this.repository.findOne(findOneOptions);
  }

  async find(findManyOptions: FindManyOptions<T> = {}) {
    return this.repository.find(findManyOptions);
  }

  async createAndSave(data: DeepPartial<T>, options: SaveOptions = {}) {
    const newEntity = this.repository.create(data);
    return this.repository.save(newEntity, options);
  }

  async update(findOption: FindOptionsWhere<T>, partialEntity: QueryDeepPartialEntity<T>) {
    return this.repository.update(findOption, partialEntity);
  }

  async delete(findOption: FindOptionsWhere<T>) {
    return this.repository.delete(findOption);
  }

  async softRemove(entities: T[], options?: RemoveOptions): Promise<T[]> {
    return this.repository.softRemove(entities, options);
  }

  async softDelete(
    criteria: string | string[] | number | number[] | Date | Date[] | ObjectId | ObjectId[] | FindOptionsWhere<T>,
  ) {
    return this.repository.softDelete(criteria);
  }

  async save(newEntity: T, options: SaveOptions = {}) {
    return this.repository.save(newEntity, options);
  }

  async saveMany(newEntities: T[], options: SaveOptions = {}) {
    return this.repository.save(newEntities, options);
  }

  async findAndCount(findManyOptions: FindManyOptions<T>) {
    return this.repository.findAndCount(findManyOptions);
  }
}
