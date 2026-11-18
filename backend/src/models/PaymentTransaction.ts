import mongoose, { Schema, Document } from 'mongoose';

export interface IPaymentTransaction extends Document {
  organizationId: mongoose.Types.ObjectId;
  invoiceNumber: string; // e.g. SIM-INV-2026-XXXX
  amountCents: number;
  currency: string;
  status: 'simulated_success' | 'failed';
  failureReason?: string;
  paymentMethod: {
    brand: string;
    last4: string;
    expMonth?: number;
    expYear?: number;
  };
  planKey: 'pro' | 'business';
  seatCount: number;
  receiptUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentTransactionSchema = new Schema<IPaymentTransaction>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    amountCents: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'USD',
      required: true,
    },
    status: {
      type: String,
      enum: ['simulated_success', 'failed'],
      required: true,
    },
    failureReason: {
      type: String,
    },
    paymentMethod: {
      brand: { type: String, default: 'Visa' },
      last4: { type: String, required: true },
      expMonth: { type: Number },
      expYear: { type: Number },
    },
    planKey: {
      type: String,
      enum: ['pro', 'business'],
      required: true,
    },
    seatCount: {
      type: Number,
      required: true,
    },
    receiptUrl: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const PaymentTransaction = mongoose.model<IPaymentTransaction>(
  'PaymentTransaction',
  PaymentTransactionSchema
);
