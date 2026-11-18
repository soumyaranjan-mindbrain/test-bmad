import mongoose, { Schema, Document } from 'mongoose';

export interface IOrganizationMember extends Document {
  organizationId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  role: 'owner' | 'admin' | 'member' | 'guest';
  status: 'active' | 'inactive' | 'invited';
  joinedAt: Date;
  hourlyRate?: number;
  createdAt: Date;
  updatedAt: Date;
}

const OrganizationMemberSchema = new Schema<IOrganizationMember>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ['owner', 'admin', 'member', 'guest'],
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'invited'],
      default: 'active',
      index: true,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    hourlyRate: {
      type: Number,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Unique compound index: One membership record per user per organization
OrganizationMemberSchema.index({ organizationId: 1, userId: 1 }, { unique: true });

export const OrganizationMember = mongoose.model<IOrganizationMember>(
  'OrganizationMember',
  OrganizationMemberSchema
);
