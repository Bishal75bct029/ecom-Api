import { Controller } from '@nestjs/common';
import { TransactionService } from '../services/transaction.service';

@Controller('admin/transactions')
export class AdminTransactionController {
  constructor(private readonly transactionService: TransactionService) {}
}
