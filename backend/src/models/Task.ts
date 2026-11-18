import mongoose, { Schema, Document } from 'mongoose';

export interface ITask extends Document {
  organizationId: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId;
  taskNumber: number;
  displayId: string;
  title: string;
  description?: string;
  columnId: string;
  status: 'backlog' | 'todo' | 'in_progress' | 'review' | 'done';
  order: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigneeId?: mongoose.Types.ObjectId;
  reporterId: mongoose.Types.ObjectId;
  labels: string[];
  storyPoints?: number;
  startDate?: Date;
  dueDate?: Date;
  estimatedHours?: number;
  version: number;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITask>(
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
    taskNumber: {
      type: Number,
      required: true,
    },
    displayId: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 255,
    },
    description: {
      type: String,
    },
    columnId: {
      type: String,
      required: true,
      default: 'todo',
      index: true,
    },
    status: {
      type: String,
      enum: ['backlog', 'todo', 'in_progress', 'review', 'done'],
      default: 'todo',
      index: true,
    },
    order: {
      type: String,
      required: true,
      index: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
      index: true,
    },
    assigneeId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    reporterId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    labels: {
      type: [String],
      default: [],
    },
    storyPoints: {
      type: Number,
      min: 0,
    },
    startDate: {
      type: Date,
    },
    dueDate: {
      type: Date,
      index: true,
    },
    estimatedHours: {
      type: Number,
      min: 0,
    },
    version: {
      type: Number,
      default: 1, // Optimistic concurrency locking
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

// Compound Indexes for fast queries
TaskSchema.index({ projectId: 1, taskNumber: 1 }, { unique: true });
TaskSchema.index({ projectId: 1, columnId: 1, order: 1 });
TaskSchema.index({ organizationId: 1, assigneeId: 1, status: 1 });

export const Task = mongoose.model<ITask>('Task', TaskSchema);
