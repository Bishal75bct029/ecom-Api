import { envConfig } from '@/configs/envConfig';
import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripeClient: Stripe.HttpClient;
  constructor() {
    this.stripeClient = new Stripe(envConfig.STRIPE_SK, {
      apiVersion: '2023-10-16',
    });
  }
}
