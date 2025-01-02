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
  InsertResult,
  SelectQueryBuilder,
  QueryRunner,
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

  async findAndCount(findManyOptions: FindManyOptions<T>) {
    return this.repository.findAndCount(findManyOptions);
  }

  async count(findManyOptions?: FindManyOptions<T>) {
    return this.repository.count(findManyOptions);
  }

  async save(newEntity: T, options?: SaveOptions): Promise<T>;
  async save(newEntity: T[], options?: SaveOptions): Promise<T[]>;
  async save(newEntity: T | T[], options: SaveOptions = {}): Promise<T | T[]> {
    if (Array.isArray(newEntity)) {
      return this.repository.save(newEntity, options);
    }
    return this.repository.save(newEntity, options);
  }

  async createAndSave(data: DeepPartial<T>, options?: SaveOptions): Promise<T>;
  async createAndSave(data: DeepPartial<T>[], options?: SaveOptions): Promise<T[]>;
  async createAndSave(data: DeepPartial<T> | DeepPartial<T[]>, options: SaveOptions = {}): Promise<T | T[]> {
    // to suffice typescript
    if (Array.isArray(data)) {
      const newEntity = this.repository.create(data);
      return this.repository.save(newEntity, options);
    }
    const newEntity = this.repository.create(data);
    return this.repository.save(newEntity, options);
  }

  async update(findOption: FindOptionsWhere<T>, partialEntity: QueryDeepPartialEntity<T>) {
    return this.repository.update(findOption, partialEntity);
  }

  async insert(entity: QueryDeepPartialEntity<T> | QueryDeepPartialEntity<T>[]): Promise<InsertResult> {
    return this.repository.insert(entity);
  }

  async delete(findOption: FindOptionsWhere<T>) {
    return this.repository.delete(findOption);
  }

  async softRemove(entities: T[] | T, options?: RemoveOptions): Promise<T[] | T> {
    if (Array.isArray(entities)) {
      return this.repository.softRemove(entities as DeepPartial<T>[], options);
    }

    return this.repository.softRemove(entities as DeepPartial<T>, options);
  }

  async softDelete(
    criteria: string | string[] | number | number[] | Date | Date[] | ObjectId | ObjectId[] | FindOptionsWhere<T>,
  ) {
    return this.repository.softDelete(criteria);
  }

  createQueryBuilder(alias?: string, queryRunner?: QueryRunner): SelectQueryBuilder<T> {
    return this.repository.createQueryBuilder(alias, queryRunner);
  }

  async restore(
    criteria: string | string[] | number | number[] | Date | Date[] | ObjectId | ObjectId[] | FindOptionsWhere<T>,
  ) {
    return this.repository.restore(criteria);
  }
}
