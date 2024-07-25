import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionEntity } from './entities/transaction.entity';
import { ApiTransactionController } from './controllers/api-transaction.controller';
import { AdminTransactionController } from './controllers/admin-transaction.controller';
import { TransactionService } from './services/transaction.service';

@Module({
  imports: [TypeOrmModule.forFeature([TransactionEntity])],
  controllers: [ApiTransactionController, AdminTransactionController],
  providers: [TransactionService],
  exports: [TransactionService],
})
export class TransactionModule {}
