import { Test, TestingModule } from '@nestjs/testing';
import { ApiProductController } from './api-product.controller';
import { ProductService } from './product.service';

describe('ProductController', () => {
  let controller: ApiProductController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApiProductController],
      providers: [ProductService],
    }).compile();

    controller = module.get<ApiProductController>(ApiProductController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
