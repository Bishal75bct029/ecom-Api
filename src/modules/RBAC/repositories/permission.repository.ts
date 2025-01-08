import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PermissionEntity } from '../entities/permission.entity';
import { AbstractService } from '@/libs/service/abstract.service';

@Injectable()
export class PermissionRepository extends AbstractService<PermissionEntity> {
  constructor(@InjectRepository(PermissionEntity) private readonly permissionRepository: Repository<PermissionEntity>) {
    super(permissionRepository);
  }
}
