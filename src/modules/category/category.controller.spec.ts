import { Test, TestingModule } from '@nestjs/testing';
import { ApiCategoryController } from './api-category.controller';
import { CategoryService } from './category.service';

describe('CategoryController', () => {
  let controller: ApiCategoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApiCategoryController],
      providers: [CategoryService],
    }).compile();

    controller = module.get<ApiCategoryController>(ApiCategoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
