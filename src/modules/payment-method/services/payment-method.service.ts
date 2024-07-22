import { Injectable } from '@nestjs/common';
import { PaymentMethodRepository } from '../repositories/payment-method.repository';

@Injectable()
export class PaymentMethodService extends PaymentMethodRepository {}
