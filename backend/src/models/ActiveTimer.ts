import mongoose, { Schema, Document } from 'mongoose';

export interface IActiveTimer extends Document {
  organizationId: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId;
  taskId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  startTime: Date;
  isRunning: boolean;
  isBillable: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ActiveTimerSchema = new Schema<IActiveTimer>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },
    taskId: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // Database lock: strictly ONE active running timer per user across platform
    },
    startTime: {
      type: Date,
      required: true,
      default: Date.now,
    },
    isRunning: {
      type: Boolean,
      default: true,
      required: true,
    },
    isBillable: {
      type: Boolean,
      default: true,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const ActiveTimer = mongoose.model<IActiveTimer>('ActiveTimer', ActiveTimerSchema);
