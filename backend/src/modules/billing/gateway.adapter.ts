export interface PaymentMethodPayload {
  cardNumber: string;
  expMonth: number;
  expYear: number;
  cvc: string;
}

export interface TransactionResult {
  success: boolean;
  transactionId: string;
  invoiceNumber: string;
  brand: string;
  last4: string;
  amountCents: number;
  currency: string;
  error?: {
    code: string;
    message: string;
    httpStatus: number;
  };
}

export interface IPaymentGateway {
  processPayment(
    organizationId: string,
    amountCents: number,
    currency: string,
    paymentMethod: PaymentMethodPayload
  ): Promise<TransactionResult>;
  cancelSubscription(subscriptionId: string): Promise<boolean>;
}

export class SimulatedPaymentGateway implements IPaymentGateway {
  async processPayment(
    organizationId: string,
    amountCents: number,
    currency: string,
    paymentMethod: PaymentMethodPayload
  ): Promise<TransactionResult> {
    const sanitizedNumber = paymentMethod.cardNumber.replace(/\s+/g, '');
    const last4 = sanitizedNumber.slice(-4) || '4242';
    const invoiceNumber = `SIM-INV-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    // Deterministic test harness rules from payment_simulation.md
    if (last4 === '0002') {
      return {
        success: false,
        transactionId: `sim_txn_${Date.now()}`,
        invoiceNumber,
        brand: 'Visa',
        last4,
        amountCents,
        currency,
        error: {
          code: 'CARD_DECLINED',
          message: 'Simulated payment failed: Insufficient funds on card.',
          httpStatus: 402,
        },
      };
    }

    if (last4 === '0003') {
      return {
        success: false,
        transactionId: `sim_txn_${Date.now()}`,
        invoiceNumber,
        brand: 'Visa',
        last4,
        amountCents,
        currency,
        error: {
          code: 'EXPIRED_CARD',
          message: 'Simulated payment failed: Card expired.',
          httpStatus: 402,
        },
      };
    }

    if (last4 === '0004') {
      return {
        success: false,
        transactionId: `sim_txn_${Date.now()}`,
        invoiceNumber,
        brand: 'Visa',
        last4,
        amountCents,
        currency,
        error: {
          code: 'GATEWAY_TIMEOUT',
          message: 'Simulated gateway timeout. Please retry.',
          httpStatus: 504,
        },
      };
    }

    // Default to success for 4242 or any other valid test number
    return {
      success: true,
      transactionId: `sim_txn_${Date.now()}`,
      invoiceNumber,
      brand: 'Visa',
      last4,
      amountCents,
      currency,
    };
  }

  async cancelSubscription(_subscriptionId: string): Promise<boolean> {
    return true;
  }
}
