import { Injectable } from '@nestjs/common';
import { PermissionRepository } from '../repositories/permission.repository';

@Injectable()
export class PermissionService extends PermissionRepository {}
