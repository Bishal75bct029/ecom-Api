import { Injectable } from '@nestjs/common';
import { ReviewRepository } from '../repositories/review.repository';

@Injectable()
export class ReviewService extends ReviewRepository {}
