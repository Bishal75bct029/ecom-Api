import { Injectable } from '@nestjs/common';
import { SchoolDiscountRepository } from '../repository/schoolDiscount.repository';

@Injectable()
export class SchoolDiscountService extends SchoolDiscountRepository {}
