import { Controller, Get, Query } from '@nestjs/common';
import { TransactionService } from '../services/transaction.service';
import { CapturePaymentDto } from '../dto/capture-payment.dto';
import { PaypalService } from '@/common/module/payment/paypal.service';

@Controller('api/transactions')
export class ApiTransactionController {
  constructor(
    private readonly transactionService: TransactionService,
    private readonly paypalService: PaypalService,
  ) {}

  @Get('capturePayment')
  async executePayment(@Query() query: CapturePaymentDto) {
    const { token } = query;

    await this.paypalService.captureOrder(token);
    const transaction = await this.transactionService.findOne({ where: { transactionId: token } });
    return await this.transactionService.save({ ...transaction, isSuccess: true });
  }
}
