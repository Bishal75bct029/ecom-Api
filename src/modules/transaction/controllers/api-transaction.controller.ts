import { Controller } from '@nestjs/common';
import { TransactionService } from '../services/transaction.service';

@Controller('api/transactions')
export class ApiTransactionController {
  constructor(private readonly transactionService: TransactionService) {}
}
