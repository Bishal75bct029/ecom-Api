import { Controller, Post, Body, BadRequestException, Req, Put, Param } from '@nestjs/common';
import { Request } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { ReviewService } from '../services/review.service';
import { UserService } from '@/modules/user/services';
import { ProductService } from '@/modules/product/services';
import { CreateReviewDto, UpdateReviewDto } from '../dto';

@ApiTags('API Review')
@Controller('api/review')
export class ApiReviewController {
  constructor(
    private readonly reviewService: ReviewService,
    private readonly userService: UserService,
    private readonly productService: ProductService,
  ) {}

  @Post()
  async create(@Body() createReviewDto: CreateReviewDto, @Req() req: Request) {
    const { id } = req.currentUser;
    const [user, product] = await Promise.all([
      this.userService.findOne({ where: { id }, select: { id: true, name: true, email: true } }),
      this.productService.findOne({ where: { id: createReviewDto.productId } }),
    ]);

    if (!user) throw new BadRequestException('User Not Found');
    if (!product) throw new BadRequestException('User Not Found');

    const productMetaIds = product.productMeta.map(({ id }) => id);

    const hasProductBeenDelivered = await this.reviewService.hasProductDelivered(productMetaIds, user.id);

    if (!hasProductBeenDelivered) throw new BadRequestException('Cannot review product which has not been delivered.');

    return this.reviewService.createAndSave({ ...createReviewDto, user, product });
  }

  @Put(':id')
  async update(@Body() updateReviewDto: UpdateReviewDto, @Param('id') id: string) {
    const review = await this.reviewService.findOne({ where: { id } });
    if (!review) throw new BadRequestException('Review Not Found');
    return this.reviewService.createAndSave({ ...updateReviewDto, id: review.id });
  }
}
