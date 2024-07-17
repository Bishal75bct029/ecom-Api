import { Injectable } from '@nestjs/common';
import { DiscountRepository } from '../repositories/discount.repository';
import { CreateDiscountDTO } from '../dto/create-discount.dto';

@Injectable()
export class DiscountService extends DiscountRepository {
  async saveDiscount(discountDto: CreateDiscountDTO) {
    const isDiscountExist = await this.findOne({ where: { couponCode: discountDto.couponCode } });

    if (isDiscountExist) {
      return this.saveDiscount({
        id: isDiscountExist.id,
        ...discountDto,
      });
    }

    return this.createAndSave(discountDto);
  }
}
