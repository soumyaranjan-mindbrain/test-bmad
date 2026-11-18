import mongoose, { Schema, Document } from 'mongoose';

export interface IOrganization extends Document {
  name: string;
  slug: string;
  logoUrl?: string;
  ownerId: mongoose.Types.ObjectId;
  status: 'active' | 'suspended' | 'archived';
  suspensionReason?: string;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const OrganizationSchema = new Schema<IOrganization>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    logoUrl: {
      type: String,
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['active', 'suspended', 'archived'],
      default: 'active',
      index: true,
    },
    suspensionReason: {
      type: String,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export const Organization = mongoose.model<IOrganization>('Organization', OrganizationSchema);
