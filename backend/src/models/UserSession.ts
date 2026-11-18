import mongoose, { Schema, Document } from 'mongoose';

export interface IUserSession extends Document {
  userId: mongoose.Types.ObjectId;
  refreshTokenHash: string;
  userAgent?: string;
  ipAddress?: string;
  expiresAt: Date;
  createdAt: Date;
}

const UserSessionSchema = new Schema<IUserSession>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    refreshTokenHash: {
      type: String,
      required: true,
      index: true,
    },
    userAgent: {
      type: String,
    },
    ipAddress: {
      type: String,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // MongoDB automatic TTL cleanup
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const UserSession = mongoose.model<IUserSession>('UserSession', UserSessionSchema);
