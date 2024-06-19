import { Injectable } from '@nestjs/common';
import { AbstractService } from '@/libs/service/abstract.service';
import { ReviewEntity } from './entities/review.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ReviewService extends AbstractService<ReviewEntity> {
  constructor(@InjectRepository(ReviewEntity) private readonly itemRepository: Repository<ReviewEntity>) {
    super(itemRepository);
  }
}
