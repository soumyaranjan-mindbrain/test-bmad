import mongoose from 'mongoose';
import { Task } from '../../models/Task.js';
import { TimeEntry } from '../../models/TimeEntry.js';
import { AuditLog } from '../../models/AuditLog.js';

export class GovernanceReportsService {
  /**
   * Velocity report: Aggregates tasks completed grouped by sprint/week
   */
  static async getTeamVelocity(organizationId: string) {
    const orgId = new mongoose.Types.ObjectId(organizationId);

    const velocityData = await Task.aggregate([
      {
        $match: {
          organizationId: orgId,
          status: 'done',
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%U', date: '$updatedAt' },
          },
          completedTaskCount: { $sum: 1 },
          tasks: { $push: { id: '$_id', title: '$title', key: '$key' } },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return velocityData;
  }

  /**
   * Time allocation report: Aggregates time spent across projects and billable vs non-billable
   */
  static async getTimeAllocation(organizationId: string) {
    const orgId = new mongoose.Types.ObjectId(organizationId);

    const allocationData = await TimeEntry.aggregate([
      {
        $match: {
          organizationId: orgId,
        },
      },
      {
        $group: {
          _id: '$isBillable',
          totalSeconds: { $sum: '$durationSeconds' },
          entriesCount: { $sum: 1 },
        },
      },
    ]);

    const formatted = {
      billableSeconds: 0,
      nonBillableSeconds: 0,
      totalSeconds: 0,
    };

    allocationData.forEach((item) => {
      if (item._id === true) {
        formatted.billableSeconds = item.totalSeconds;
      } else {
        formatted.nonBillableSeconds = item.totalSeconds;
      }
    });
    formatted.totalSeconds = formatted.billableSeconds + formatted.nonBillableSeconds;

    return formatted;
  }

  /**
   * Immutable Audit Log append
   */
  static async recordAuditEvent(
    organizationId: string,
    actorId: string,
    actorEmail: string,
    action: string,
    targetType: string,
    targetId?: string,
    details: Record<string, any> = {},
    ipAddress?: string,
    userAgent?: string
  ) {
    return AuditLog.create({
      organizationId: new mongoose.Types.ObjectId(organizationId),
      actorId: new mongoose.Types.ObjectId(actorId),
      actorEmail,
      action,
      targetType,
      targetId,
      details,
      ipAddress,
      userAgent,
    });
  }

  /**
   * Query Audit Logs
   */
  static async getAuditLogs(organizationId: string, limit = 50) {
    const orgId = new mongoose.Types.ObjectId(organizationId);
    return AuditLog.find({ organizationId: orgId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }
}
