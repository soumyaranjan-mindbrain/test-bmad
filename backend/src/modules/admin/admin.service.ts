import mongoose from 'mongoose';
import { Organization } from '../../models/Organization.js';
import { User } from '../../models/User.js';
import { PaymentTransaction } from '../../models/PaymentTransaction.js';
import { UserSession } from '../../models/UserSession.js';
import { OrganizationMember } from '../../models/OrganizationMember.js';
import { AppError } from '../../utils/errors.js';
import { io } from '../../server.js';

export class AdminService {
  /**
   * Platform telemetry overview
   */
  static async getPlatformTelemetry() {
    const [
      totalTenants,
      activeTenants,
      suspendedTenants,
      totalUsers,
      successfulTransactions,
    ] = await Promise.all([
      Organization.countDocuments({ isDeleted: false }),
      Organization.countDocuments({ status: 'active', isDeleted: false }),
      Organization.countDocuments({ status: 'suspended', isDeleted: false }),
      User.countDocuments({ isDeleted: { $ne: true } }),
      PaymentTransaction.find({ status: 'simulated_success' }).lean(),
    ]);

    const totalSimulatedRevenueCents = successfulTransactions.reduce(
      (sum, tx) => sum + (tx.amountCents || 0),
      0
    );

    return {
      tenants: {
        total: totalTenants,
        active: activeTenants,
        suspended: suspendedTenants,
      },
      users: {
        total: totalUsers,
      },
      simulatedBilling: {
        totalRevenueUsd: (totalSimulatedRevenueCents / 100).toFixed(2),
        totalTransactionsCount: successfulTransactions.length,
      },
    };
  }

  /**
   * List all tenant organizations with their owner and member counts
   */
  static async listTenants(page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const tenants = await Organization.find({ isDeleted: false })
      .populate('ownerId', 'email fullName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Organization.countDocuments({ isDeleted: false });

    return {
      tenants,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Suspend a tenant organization:
   * 1. Set status to 'suspended'
   * 2. Revoke refresh token sessions of all members of this tenant
   * 3. Disconnect real-time WebSocket sockets in room `org:<orgId>`
   */
  static async suspendOrganization(organizationId: string, reason: string) {
    const org = await Organization.findById(organizationId);
    if (!org) {
      throw new AppError('Organization not found.', 404, 'ORGANIZATION_NOT_FOUND');
    }

    org.status = 'suspended';
    org.suspensionReason = reason || 'Administrative compliance suspension';
    await org.save();

    // Find all users in this tenant
    const members = await OrganizationMember.find({ organizationId: org._id });
    const userIds = members.map((m) => m.userId);

    // Revoke their sessions so they are immediately kicked out
    await UserSession.updateMany(
      { userId: { $in: userIds }, isRevoked: false },
      { isRevoked: true }
    );

    // Disconnect active WebSocket connections in this tenant's room
    if (io) {
      io.to(`org:${organizationId}`).emit('tenant:suspended', {
        organizationId,
        reason: org.suspensionReason,
      });
      io.in(`org:${organizationId}`).disconnectSockets(true);
    }

    return {
      message: `Organization '${org.name}' has been suspended, active sessions revoked, and WebSockets disconnected.`,
      organization: org,
    };
  }

  /**
   * Reactivate a suspended organization
   */
  static async reactivateOrganization(organizationId: string) {
    const org = await Organization.findById(organizationId);
    if (!org) {
      throw new AppError('Organization not found.', 404, 'ORGANIZATION_NOT_FOUND');
    }

    org.status = 'active';
    org.suspensionReason = undefined;
    await org.save();

    return {
      message: `Organization '${org.name}' has been reactivated.`,
      organization: org,
    };
  }
}
