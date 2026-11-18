import { Project } from '../../models/Project.js';
import { ProjectMember } from '../../models/ProjectMember.js';
import { AppError } from '../../utils/errors.js';
import { CreateProjectInput, UpdateProjectInput } from './project.schemas.js';

const FREE_PLAN_MAX_PROJECTS = 3;

export class ProjectService {
  static async createProject(orgId: string, userId: string, input: CreateProjectInput) {
    // 1. Quota Check (Free Plan: maximum 3 active projects per organization)
    const activeProjectsCount = await Project.countDocuments({
      organizationId: orgId,
      status: 'active',
      isDeleted: false,
    });

    if (activeProjectsCount >= FREE_PLAN_MAX_PROJECTS) {
      throw new AppError(
        `Project quota reached (Maximum ${FREE_PLAN_MAX_PROJECTS} active projects on Free plan). Please upgrade to Pro for unlimited projects.`,
        402,
        'PROJECT_QUOTA_EXCEEDED'
      );
    }

    // 2. Check Key Uniqueness within Organization
    const existingKey = await Project.findOne({
      organizationId: orgId,
      key: input.key,
      isDeleted: false,
    });
    if (existingKey) {
      throw new AppError(
        `A project with key '${input.key}' already exists in this organization.`,
        409,
        'PROJECT_KEY_EXISTS'
      );
    }

    // 3. Create Project Document
    const project = await Project.create({
      organizationId: orgId,
      name: input.name,
      key: input.key,
      description: input.description,
      leadId: userId,
      targetDeliveryDate: input.targetDeliveryDate,
      status: 'active',
    });

    // 4. Assign Creator as Project Manager
    await ProjectMember.create({
      organizationId: orgId,
      projectId: project._id,
      userId,
      role: 'project_manager',
    });

    return project;
  }

  static async listProjects(orgId: string, userId: string, isOrgAdmin: boolean) {
    if (isOrgAdmin) {
      // Admins and Owners can view all projects in the organization
      return Project.find({
        organizationId: orgId,
        isDeleted: false,
      })
        .populate('leadId', 'fullName email avatarUrl')
        .sort({ updatedAt: -1 });
    }

    // Regular members & guests view projects they are assigned to
    const memberProjects = await ProjectMember.find({
      organizationId: orgId,
      userId,
    }).select('projectId');

    const projectIds = memberProjects.map(m => m.projectId);

    return Project.find({
      _id: { $in: projectIds },
      organizationId: orgId,
      isDeleted: false,
    })
      .populate('leadId', 'fullName email avatarUrl')
      .sort({ updatedAt: -1 });
  }

  static async getProjectById(orgId: string, projectId: string) {
    const project = await Project.findOne({
      _id: projectId,
      organizationId: orgId,
      isDeleted: false,
    }).populate('leadId', 'fullName email avatarUrl');

    if (!project) {
      throw new AppError('Project not found.', 404, 'PROJECT_NOT_FOUND');
    }

    return project;
  }

  static async updateProject(orgId: string, projectId: string, input: UpdateProjectInput) {
    const project = await Project.findOneAndUpdate(
      { _id: projectId, organizationId: orgId, isDeleted: false },
      { $set: input },
      { new: true }
    );

    if (!project) {
      throw new AppError('Project not found.', 404, 'PROJECT_NOT_FOUND');
    }

    return project;
  }

  static async archiveProject(orgId: string, projectId: string) {
    const project = await Project.findOneAndUpdate(
      { _id: projectId, organizationId: orgId, isDeleted: false },
      { status: 'archived_read_only' },
      { new: true }
    );

    if (!project) {
      throw new AppError('Project not found.', 404, 'PROJECT_NOT_FOUND');
    }

    return project;
  }
}
