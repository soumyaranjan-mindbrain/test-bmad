import mongoose, { Schema, Document } from 'mongoose';

export interface ITaskAttachment extends Document {
  organizationId: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId;
  taskId: mongoose.Types.ObjectId;
  uploaderId: mongoose.Types.ObjectId;
  fileName: string;
  fileSize: number;
  mimeType: string;
  cloudinaryPublicId: string;
  secureUrl: string;
  createdAt: Date;
}

const TaskAttachmentSchema = new Schema<ITaskAttachment>(
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
    uploaderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    fileName: {
      type: String,
      required: true,
      trim: true,
    },
    fileSize: {
      type: Number,
      required: true,
      min: 1,
    },
    mimeType: {
      type: String,
      required: true,
    },
    cloudinaryPublicId: {
      type: String,
      required: true,
    },
    secureUrl: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

TaskAttachmentSchema.index({ taskId: 1, createdAt: -1 });

export const TaskAttachment = mongoose.model<ITaskAttachment>('TaskAttachment', TaskAttachmentSchema);
