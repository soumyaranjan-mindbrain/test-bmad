import mongoose, { Schema, Document } from 'mongoose';

export interface IInvitation extends Document {
  organizationId: mongoose.Types.ObjectId;
  email: string;
  role: 'admin' | 'member' | 'guest';
  invitedBy: mongoose.Types.ObjectId;
  token: string;
  status: 'pending' | 'accepted' | 'expired' | 'revoked';
  expiresAt: Date;
  createdAt: Date;
}

const InvitationSchema = new Schema<IInvitation>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    role: {
      type: String,
      enum: ['admin', 'member', 'guest'],
      required: true,
    },
    invitedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'expired', 'revoked'],
      default: 'pending',
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // Automatic TTL cleanup after 72h expiration
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Compound index: Prevent duplicate pending invitations for the same email in one org
InvitationSchema.index({ organizationId: 1, email: 1, status: 1 });

export const Invitation = mongoose.model<IInvitation>('Invitation', InvitationSchema);
