import mongoose, { Schema, Document } from 'mongoose';

export interface ITaskDependency extends Document {
  organizationId: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId;
  predecessorTaskId: mongoose.Types.ObjectId;
  successorTaskId: mongoose.Types.ObjectId;
  dependencyType: 'finish_to_start';
  createdAt: Date;
}

const TaskDependencySchema = new Schema<ITaskDependency>(
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
    predecessorTaskId: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
      required: true,
      index: true,
    },
    successorTaskId: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
      required: true,
      index: true,
    },
    dependencyType: {
      type: String,
      enum: ['finish_to_start'],
      default: 'finish_to_start',
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Unique compound index: Prevent duplicate dependencies between the same two tasks
TaskDependencySchema.index(
  { predecessorTaskId: 1, successorTaskId: 1 },
  { unique: true }
);

export const TaskDependency = mongoose.model<ITaskDependency>(
  'TaskDependency',
  TaskDependencySchema
);
