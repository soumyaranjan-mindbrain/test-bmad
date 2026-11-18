import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  fullName: string;
  displayName?: string;
  avatarUrl?: string;
  isSuperAdmin: boolean;
  status: 'active' | 'suspended' | 'pending_verification';
  preferences: {
    theme: 'light' | 'dark' | 'system';
    emailNotifications: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    displayName: {
      type: String,
      trim: true,
      maxlength: 50,
    },
    avatarUrl: {
      type: String,
    },
    isSuperAdmin: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['active', 'suspended', 'pending_verification'],
      default: 'active',
      index: true,
    },
    preferences: {
      theme: {
        type: String,
        enum: ['light', 'dark', 'system'],
        default: 'system',
      },
      emailNotifications: {
        type: Boolean,
        default: true,
      },
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete (ret as Record<string, unknown>).passwordHash;
        delete (ret as Record<string, unknown>).__v;
        return ret;
      },
    },
  }
);

export const User = mongoose.model<IUser>('User', UserSchema);
