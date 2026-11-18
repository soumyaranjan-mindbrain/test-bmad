import mongoose, { Schema, Document } from 'mongoose';

export interface IProjectMember extends Document {
  organizationId: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  role: 'project_manager' | 'team_lead' | 'member' | 'viewer';
  assignedAt: Date;
}

const ProjectMemberSchema = new Schema<IProjectMember>(
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
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ['project_manager', 'team_lead', 'member', 'viewer'],
      default: 'member',
      required: true,
    },
    assignedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// One project membership per user per project
ProjectMemberSchema.index({ projectId: 1, userId: 1 }, { unique: true });

export const ProjectMember = mongoose.model<IProjectMember>(
  'ProjectMember',
  ProjectMemberSchema
);
