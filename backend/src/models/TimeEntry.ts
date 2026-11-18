import mongoose, { Schema, Document } from 'mongoose';

export interface ITimeEntry extends Document {
  organizationId: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId;
  taskId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  date: Date;
  durationMinutes: number;
  isBillable: boolean;
  hourlyRateSnapshot?: number;
  notes?: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TimeEntrySchema = new Schema<ITimeEntry>(
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
      index: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    durationMinutes: {
      type: Number,
      required: true,
      min: 1,
    },
    isBillable: {
      type: Boolean,
      default: true,
      required: true,
    },
    hourlyRateSnapshot: {
      type: Number,
      min: 0,
    },
    notes: {
      type: String,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for timesheet querying
TimeEntrySchema.index({ organizationId: 1, userId: 1, date: -1 });

export const TimeEntry = mongoose.model<ITimeEntry>('TimeEntry', TimeEntrySchema);
