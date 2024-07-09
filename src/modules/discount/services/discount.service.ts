import { AbstractService } from '@/libs/service/abstract.service';
import { Injectable } from '@nestjs/common';
import { DiscountEntity } from '../entity/discount.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
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
  I;
}
