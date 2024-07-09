import { Injectable } from '@nestjs/common';
import { ReviewRepository } from '../repositories/review.repository';

@Injectable()
export class ReviewService extends ReviewRepository {
  async hasProductDelivered(productMetaIds: string[], userId: string) {
    return this.countDeliveredProducts(productMetaIds, userId);
  }
}
