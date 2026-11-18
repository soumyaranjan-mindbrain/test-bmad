import mongoose, { Schema, Document } from 'mongoose';

export interface ISubscriptionPlan {
  planKey: 'free' | 'pro' | 'business';
  name: string;
  pricePerSeatMonthCents: number;
  maxProjects: number; // -1 for unlimited
  maxMembers: number;  // -1 for unlimited
  features: string[];
}

export interface IOrganizationSubscription extends Document {
  organizationId: mongoose.Types.ObjectId;
  planKey: 'free' | 'pro' | 'business';
  status: 'active' | 'past_due' | 'canceled';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  stripeCustomerId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrganizationSubscriptionSchema = new Schema<IOrganizationSubscription>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      unique: true,
      index: true,
    },
    planKey: {
      type: String,
      enum: ['free', 'pro', 'business'],
      default: 'free',
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'past_due', 'canceled'],
      default: 'active',
      required: true,
    },
    currentPeriodStart: {
      type: Date,
      default: Date.now,
      required: true,
    },
    currentPeriodEnd: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 days
      required: true,
    },
    cancelAtPeriodEnd: {
      type: Boolean,
      default: false,
    },
    stripeCustomerId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const OrganizationSubscription = mongoose.model<IOrganizationSubscription>(
  'OrganizationSubscription',
  OrganizationSubscriptionSchema
);
