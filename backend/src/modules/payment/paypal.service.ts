import { env } from '../../config/env.config.js';

type PayPalOrderResponse = {
  id: string;
  status: string;
  links?: Array<{ href: string; rel: string; method: string }>;
  simulated?: boolean;
};

export class PayPalService {
  private get baseUrl() {
    return env.paypal.mode === 'live'
      ? 'https://api-m.paypal.com'
      : 'https://api-m.sandbox.paypal.com';
  }

  async createOrder(amount: number, currency = 'USD'): Promise<PayPalOrderResponse> {
    if (!env.paypal.clientId || !env.paypal.clientSecret) {
      return {
        id: `SIM-${Date.now()}`,
        status: 'COMPLETED',
        simulated: true,
      };
    }

    const accessToken = await this.getAccessToken();
    const response = await fetch(`${this.baseUrl}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: currency,
              value: amount.toFixed(2),
            },
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error('Unable to create PayPal order');
    }

    return response.json() as Promise<PayPalOrderResponse>;
  }

  private async getAccessToken() {
    const credentials = Buffer.from(`${env.paypal.clientId}:${env.paypal.clientSecret}`).toString('base64');
    const response = await fetch(`${this.baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
      throw new Error('Unable to authenticate with PayPal');
    }

    const data = await response.json() as { access_token: string };
    return data.access_token;
  }
}
