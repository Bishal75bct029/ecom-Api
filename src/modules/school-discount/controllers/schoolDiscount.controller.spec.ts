import { Test, TestingModule } from '@nestjs/testing';
import { SchoolDiscountController } from './admin-schoolDiscount.controller';

describe('SchoolDiscountController', () => {
  let controller: SchoolDiscountController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SchoolDiscountController],
    }).compile();

    controller = module.get<SchoolDiscountController>(SchoolDiscountController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
