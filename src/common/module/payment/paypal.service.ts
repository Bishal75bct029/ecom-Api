import { Injectable } from '@nestjs/common';
import paypal from '@paypal/checkout-server-sdk';
import { envConfig } from '@/configs/envConfig';
import { PayPalHttpClient } from '@paypal/checkout-server-sdk/lib/core/paypal_http_client';
import { PurchaseUnitRequest } from '@paypal/checkout-server-sdk/lib/orders/lib';
import paypalhttp from '@paypal/paypalhttp';

@Injectable()
export class PaypalService {
  private paypalClient: PayPalHttpClient;

  constructor() {
    // this.paypalClient = new paypal.core.PayPalHttpClient(
    //   envConfig.NODE_ENV === 'production'
    //     ? new paypal.core.LiveEnvironment(envConfig.PAYPAL_CLIENT_ID, envConfig.PAYPAL_CLIENT_SECRET)
    //     : new paypal.core.SandboxEnvironment(envConfig.PAYPAL_CLIENT_ID, envConfig.PAYPAL_CLIENT_SECRET),
    // );
  }

  public async createPayment(purchaseUnits: PurchaseUnitRequest[]): Promise<paypalhttp.HttpResponse<any>> {
    try {
      const request = new paypal.orders.OrdersCreateRequest().requestBody({
        intent: 'CAPTURE',
        purchase_units: purchaseUnits,
        application_context: {
          return_url: envConfig.PAYPAL_RETURN_URL,
          cancel_url: envConfig.PAYPAL_CANCEL_URL,
        },
      });
      return await this.paypalClient.execute(request);
    } catch (err) {
      throw err;
    }
  }

  public async captureOrder(token: string): Promise<paypalhttp.HttpResponse<any>> {
    try {
      const request = new paypal.orders.OrdersCaptureRequest(token);
      return await this.paypalClient.execute(request);
    } catch (err) {
      throw err;
    }
  }
}
