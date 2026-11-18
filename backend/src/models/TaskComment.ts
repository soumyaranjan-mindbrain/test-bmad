import mongoose, { Schema, Document } from 'mongoose';

export interface ITaskComment extends Document {
  organizationId: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId;
  taskId: mongoose.Types.ObjectId;
  authorId: mongoose.Types.ObjectId;
  text: string;
  isInternal: boolean;
  isEdited: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TaskCommentSchema = new Schema<ITaskComment>(
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
    authorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },
    isInternal: {
      type: Boolean,
      default: false,
      index: true, // Used by serialization privacy filter
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for chronological comment feeds per task
TaskCommentSchema.index({ taskId: 1, createdAt: 1 });

export const TaskComment = mongoose.model<ITaskComment>('TaskComment', TaskCommentSchema);
