import { Injectable } from '@nestjs/common';
import { TransactionRepository } from '../repositories/transaction.repository';

@Injectable()
export class TransactionService extends TransactionRepository {
  genTransactionCode() {
    const str = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const timeStamp = Date.now();

    return timeStamp
      .toString()
      .split('')
      .reduce((acc, cur) => {
        return acc + str[cur];
      }, '');
  }
}
