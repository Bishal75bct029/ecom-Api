import { Injectable } from '@nestjs/common';
import { OrderStatusHistoryRepository } from '../repositories/order-history.repository';

@Injectable()
export class OrderStatusHistoryService extends OrderStatusHistoryRepository {}
