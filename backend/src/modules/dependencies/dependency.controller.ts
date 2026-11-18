import { Request, Response, NextFunction } from 'express';
import { DependencyService } from './dependency.service.js';
import { createDependencySchema } from './dependency.schemas.js';

export class DependencyController {
  static async add(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedInput = createDependencySchema.parse(req.body);
      const orgId = req.org!._id.toString();
      const successorTaskId = Array.isArray(req.params.taskId) ? req.params.taskId[0] : req.params.taskId;

      const dependency = await DependencyService.addDependency(
        orgId,
        successorTaskId,
        validatedInput.predecessorTaskId
      );

      res.status(201).json({
        success: true,
        data: {
          dependency,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async get(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.org!._id.toString();
      const taskId = Array.isArray(req.params.taskId) ? req.params.taskId[0] : req.params.taskId;

      const dependencies = await DependencyService.getTaskDependencies(orgId, taskId);

      res.status(200).json({
        success: true,
        data: dependencies,
      });
    } catch (error) {
      next(error);
    }
  }

  static async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.org!._id.toString();
      const successorTaskId = Array.isArray(req.params.taskId) ? req.params.taskId[0] : req.params.taskId;
      const predecessorTaskId = Array.isArray(req.params.predecessorId) ? req.params.predecessorId[0] : req.params.predecessorId;

      await DependencyService.removeDependency(orgId, predecessorTaskId, successorTaskId);

      res.status(200).json({
        success: true,
        data: {
          message: 'Dependency removed successfully.',
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
