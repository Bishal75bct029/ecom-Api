import { Test, TestingModule } from '@nestjs/testing';
import { ApiSchoolDiscountController } from './api-schoolDiscount.controller';

describe('SchoolDiscountController', () => {
  let controller: ApiSchoolDiscountController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApiSchoolDiscountController],
    }).compile();

    controller = module.get<ApiSchoolDiscountController>(ApiSchoolDiscountController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
