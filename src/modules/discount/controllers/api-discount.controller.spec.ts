import { Test, TestingModule } from '@nestjs/testing';
import { ApiDiscountController } from './api-discount.controller';

describe('ApiDiscountController', () => {
  let controller: ApiDiscountController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApiDiscountController],
    }).compile();

    controller = module.get<ApiDiscountController>(ApiDiscountController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
