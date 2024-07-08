import { Test, TestingModule } from '@nestjs/testing';
import { AdminDiscountController } from './admin-discount.controller';

describe('AdminDiscountController', () => {
  let controller: AdminDiscountController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminDiscountController],
    }).compile();

    controller = module.get<AdminDiscountController>(AdminDiscountController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
