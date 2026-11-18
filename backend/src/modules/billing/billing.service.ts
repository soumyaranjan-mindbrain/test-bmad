import mongoose from 'mongoose';
import { OrganizationSubscription } from '../../models/OrganizationSubscription.js';
import { PaymentTransaction } from '../../models/PaymentTransaction.js';
import { OrganizationMember } from '../../models/OrganizationMember.js';
import { Project } from '../../models/Project.js';
import { SimulatedPaymentGateway, type PaymentMethodPayload } from './gateway.adapter.js';
import { AppError } from '../../utils/errors.js';

const gateway = new SimulatedPaymentGateway();

export const PLAN_CONFIGS = {
  free: {
    planKey: 'free',
    name: 'Free Starter',
    pricePerSeatMonthCents: 0,
    maxProjects: 3,
    maxMembers: 5,
  },
  pro: {
    planKey: 'pro',
    name: 'Pro Team',
    pricePerSeatMonthCents: 1200, // $12.00
    maxProjects: -1, // Unlimited
    maxMembers: -1,
  },
  business: {
    planKey: 'business',
    name: 'Business Enterprise',
    pricePerSeatMonthCents: 2500, // $25.00
    maxProjects: -1,
    maxMembers: -1,
  },
} as const;

export class BillingService {
  /**
   * Get current subscription & quota status for an organization
   */
  static async getSubscriptionStatus(organizationId: string) {
    const orgId = new mongoose.Types.ObjectId(organizationId);
    let sub = await OrganizationSubscription.findOne({ organizationId: orgId });

    if (!sub) {
      sub = await OrganizationSubscription.create({
        organizationId: orgId,
        planKey: 'free',
        status: 'active',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });
    }

    const [memberCount, projectCount] = await Promise.all([
      OrganizationMember.countDocuments({ organizationId: orgId, status: 'active' }),
      Project.countDocuments({ organizationId: orgId, status: { $ne: 'archived_read_only' } }),
    ]);

    const planConfig = PLAN_CONFIGS[sub.planKey as keyof typeof PLAN_CONFIGS] || PLAN_CONFIGS.free;

    return {
      subscription: sub,
      plan: planConfig,
      usage: {
        activeMembers: memberCount,
        maxMembers: planConfig.maxMembers,
        activeProjects: projectCount,
        maxProjects: planConfig.maxProjects,
      },
    };
  }

  /**
   * Process simulated upgrade to Pro or Business
   */
  static async upgradePlan(
    organizationId: string,
    targetPlan: 'pro' | 'business',
    paymentMethod: PaymentMethodPayload
  ) {
    const orgId = new mongoose.Types.ObjectId(organizationId);
    const planConfig = PLAN_CONFIGS[targetPlan];
    if (!planConfig) {
      throw new AppError('Target subscription plan is invalid.', 400, 'INVALID_PLAN');
    }

    const activeMembers = await OrganizationMember.countDocuments({
      organizationId: orgId,
      status: 'active',
    });

    const seatCount = Math.max(1, activeMembers);
    const amountCents = seatCount * planConfig.pricePerSeatMonthCents;

    // Process through Payment Gateway Adapter
    const paymentResult = await gateway.processPayment(
      organizationId,
      amountCents,
      'USD',
      paymentMethod
    );

    if (!paymentResult.success && paymentResult.error) {
      // Record failed transaction attempt
      await PaymentTransaction.create({
        organizationId: orgId,
        invoiceNumber: paymentResult.invoiceNumber,
        amountCents,
        currency: 'USD',
        status: 'failed',
        failureReason: paymentResult.error.message,
        paymentMethod: {
          brand: paymentResult.brand,
          last4: paymentResult.last4,
          expMonth: paymentMethod.expMonth,
          expYear: paymentMethod.expYear,
        },
        planKey: targetPlan,
        seatCount,
      });

      throw new AppError(
        paymentResult.error.message,
        paymentResult.error.httpStatus,
        paymentResult.error.code
      );
    }

    // Record successful transaction
    const transaction = await PaymentTransaction.create({
      organizationId: orgId,
      invoiceNumber: paymentResult.invoiceNumber,
      amountCents,
      currency: 'USD',
      status: 'simulated_success',
      paymentMethod: {
        brand: paymentResult.brand,
        last4: paymentResult.last4,
        expMonth: paymentMethod.expMonth,
        expYear: paymentMethod.expYear,
      },
      planKey: targetPlan,
      seatCount,
      receiptUrl: `/api/v1/billing/invoices/${paymentResult.invoiceNumber}/receipt`,
    });

    // Update subscription period & plan
    const updatedSub = await OrganizationSubscription.findOneAndUpdate(
      { organizationId: orgId },
      {
        planKey: targetPlan,
        status: 'active',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 days
        cancelAtPeriodEnd: false,
      },
      { upsert: true, new: true }
    );

    return {
      subscription: updatedSub,
      transaction,
    };
  }

  /**
   * Graceful Downgrade to Free
   * Owner selects 3 active projects; excess projects become 'archived_read_only'.
   * Excess members beyond 5 become 'inactive'.
   */
  static async gracefulDowngrade(
    organizationId: string,
    retainedProjectIds: string[]
  ) {
    const orgId = new mongoose.Types.ObjectId(organizationId);

    if (retainedProjectIds.length > 3) {
      throw new AppError(
        'Free plan allows a maximum of 3 retained active projects.',
        400,
        'QUOTA_EXCEEDED'
      );
    }

    const objectIdList = retainedProjectIds.map((id) => new mongoose.Types.ObjectId(id));

    // Archive all projects NOT in retained list
    await Project.updateMany(
      {
        organizationId: orgId,
        _id: { $nin: objectIdList },
      },
      {
        status: 'archived_read_only',
      }
    );

    // Keep retained projects active
    await Project.updateMany(
      {
        organizationId: orgId,
        _id: { $in: objectIdList },
      },
      {
        status: 'active',
      }
    );

    // Cap active members to 5 (keep earliest 5 members active, set excess to inactive)
    const allMembers = await OrganizationMember.find({
      organizationId: orgId,
      status: 'active',
    }).sort({ createdAt: 1 });

    if (allMembers.length > 5) {
      const excessMemberIds = allMembers.slice(5).map((m) => m._id);
      await OrganizationMember.updateMany(
        { _id: { $in: excessMemberIds } },
        { status: 'inactive' }
      );
    }

    // Set subscription to Free
    const updatedSub = await OrganizationSubscription.findOneAndUpdate(
      { organizationId: orgId },
      {
        planKey: 'free',
        status: 'active',
        cancelAtPeriodEnd: false,
      },
      { new: true }
    );

    return {
      message: 'Downgraded successfully. Excess resources archived with zero data loss.',
      subscription: updatedSub,
    };
  }

  /**
   * List billing history / invoices
   */
  static async listInvoices(organizationId: string) {
    const orgId = new mongoose.Types.ObjectId(organizationId);
    return PaymentTransaction.find({ organizationId: orgId })
      .sort({ createdAt: -1 })
      .lean();
  }

  /**
   * Get printable simulated receipt payload
   */
  static async getInvoiceReceipt(invoiceNumber: string) {
    const invoice = await PaymentTransaction.findOne({ invoiceNumber }).populate('organizationId');
    if (!invoice) {
      throw new AppError('Invoice receipt not found.', 404, 'INVOICE_NOT_FOUND');
    }
    return invoice;
  }
}
