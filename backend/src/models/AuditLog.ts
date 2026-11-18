import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  organizationId: mongoose.Types.ObjectId;
  actorId: mongoose.Types.ObjectId;
  actorEmail: string;
  action: string; // e.g. 'project:create', 'plan:upgrade', 'member:role_change'
  targetType: string; // 'Project', 'Task', 'Organization', 'Subscription'
  targetId?: string;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    actorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    actorEmail: {
      type: String,
      required: true,
    },
    action: {
      type: String,
      required: true,
      index: true,
    },
    targetType: {
      type: String,
      required: true,
    },
    targetId: {
      type: String,
    },
    details: {
      type: Schema.Types.Mixed,
      default: {},
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Immutable append-only log
  }
);

// Compound index for chronological querying within tenant
AuditLogSchema.index({ organizationId: 1, createdAt: -1 });

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
