import mongoose, { Schema, Document } from 'mongoose';

export interface IProject extends Document {
  organizationId: mongoose.Types.ObjectId;
  name: string;
  key: string;
  description?: string;
  leadId: mongoose.Types.ObjectId;
  status: 'active' | 'archived_read_only' | 'completed';
  targetDeliveryDate?: Date;
  columns: {
    id: string;
    name: string;
    order: number;
    wipLimit?: number;
  }[];
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    key: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      minlength: 2,
      maxlength: 10,
    },
    description: {
      type: String,
      maxlength: 1000,
    },
    leadId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['active', 'archived_read_only', 'completed'],
      default: 'active',
      index: true,
    },
    targetDeliveryDate: {
      type: Date,
    },
    columns: {
      type: [
        {
          id: { type: String, required: true },
          name: { type: String, required: true },
          order: { type: Number, required: true },
          wipLimit: { type: Number },
        },
      ],
      default: [
        { id: 'backlog', name: 'Backlog', order: 0 },
        { id: 'todo', name: 'To Do', order: 1 },
        { id: 'in_progress', name: 'In Progress', order: 2, wipLimit: 5 },
        { id: 'review', name: 'In Review', order: 3 },
        { id: 'done', name: 'Done', order: 4 },
      ],
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

// Unique Project Key per Organization (e.g. ACME-101)
ProjectSchema.index({ organizationId: 1, key: 1 }, { unique: true });
ProjectSchema.index({ organizationId: 1, status: 1 });

export const Project = mongoose.model<IProject>('Project', ProjectSchema);
