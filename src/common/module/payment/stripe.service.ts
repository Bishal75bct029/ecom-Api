import { envConfig } from '@/configs/envConfig';
import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripeClient: Stripe;

  constructor() {
    this.stripeClient = new Stripe(envConfig.STRIPE_SK, {
      apiVersion: '2024-06-20',
    });
  }

  public async createPaymentIntent(
    params: Stripe.PaymentIntentCreateParams,
    options?: Stripe.RequestOptions,
  ): Promise<Stripe.PaymentIntent> {
    try {
      return await this.stripeClient.paymentIntents.create(
        {
          ...params,
          payment_method: envConfig.NODE_ENV === 'production' ? 'card' : 'pm_card_visa',
          currency: 'sgd',
        },
        options,
      );
    } catch (error) {
      throw error;
    }
  }

  public async constructEvent(payload: string | Buffer, signature: string) {
    return await this.stripeClient.webhooks.constructEventAsync(
      payload,
      signature,
      envConfig.STRIPE_WEBHOOK_ENDPOINT_SECRET,
    );
  }

  public async capturePaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    return this.stripeClient.paymentIntents.capture(paymentIntentId);
  }
}
