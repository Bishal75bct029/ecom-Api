import { Test, TestingModule } from '@nestjs/testing';
import { ApiPaymentMethodController } from './api-payment-method.controller';
import { PaymentMethodService } from '../services/payment-method.service';

describe('PaymentMethodController', () => {
  let controller: ApiPaymentMethodController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApiPaymentMethodController],
      providers: [PaymentMethodService],
    }).compile();

    controller = module.get<ApiPaymentMethodController>(ApiPaymentMethodController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
