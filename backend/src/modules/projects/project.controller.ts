import { Request, Response, NextFunction } from 'express';
import { ProjectService } from './project.service.js';
import { createProjectSchema, updateProjectSchema } from './project.schemas.js';

export class ProjectController {
  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedInput = createProjectSchema.parse(req.body);
      const orgId = req.org!._id.toString();
      const userId = req.user!.userId;

      const project = await ProjectService.createProject(orgId, userId, validatedInput);

      res.status(201).json({
        success: true,
        data: {
          project,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.org!._id.toString();
      const userId = req.user!.userId;
      const isOrgAdmin = ['owner', 'admin'].includes(req.membership!.role);

      const projects = await ProjectService.listProjects(orgId, userId, isOrgAdmin);

      res.status(200).json({
        success: true,
        data: {
          projects,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.org!._id.toString();
      const projectId = Array.isArray(req.params.projectId) ? req.params.projectId[0] : req.params.projectId;

      const project = await ProjectService.getProjectById(orgId, projectId);

      res.status(200).json({
        success: true,
        data: {
          project,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedInput = updateProjectSchema.parse(req.body);
      const orgId = req.org!._id.toString();
      const projectId = Array.isArray(req.params.projectId) ? req.params.projectId[0] : req.params.projectId;

      const project = await ProjectService.updateProject(orgId, projectId, validatedInput);

      res.status(200).json({
        success: true,
        data: {
          project,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async archive(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.org!._id.toString();
      const projectId = Array.isArray(req.params.projectId) ? req.params.projectId[0] : req.params.projectId;

      const project = await ProjectService.archiveProject(orgId, projectId);

      res.status(200).json({
        success: true,
        data: {
          message: 'Project archived as read-only.',
          project,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
