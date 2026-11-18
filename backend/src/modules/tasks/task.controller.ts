import { Request, Response, NextFunction } from 'express';
import { TaskService } from './task.service.js';
import { createTaskSchema, updateTaskSchema } from './task.schemas.js';

export class TaskController {
  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedInput = createTaskSchema.parse(req.body);
      const orgId = req.org!._id.toString();
      const projectId = Array.isArray(req.params.projectId) ? req.params.projectId[0] : req.params.projectId;
      const reporterId = req.user!.userId;

      const task = await TaskService.createTask(orgId, projectId, reporterId, validatedInput);

      res.status(201).json({
        success: true,
        data: {
          task,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.org!._id.toString();
      const projectId = Array.isArray(req.params.projectId) ? req.params.projectId[0] : req.params.projectId;
      const { columnId, assigneeId, status } = req.query as { columnId?: string; assigneeId?: string; status?: string };

      const tasks = await TaskService.listTasks(orgId, projectId, { columnId, assigneeId, status });

      res.status(200).json({
        success: true,
        data: {
          tasks,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.org!._id.toString();
      const taskId = Array.isArray(req.params.taskId) ? req.params.taskId[0] : req.params.taskId;

      const task = await TaskService.getTaskById(orgId, taskId);

      res.status(200).json({
        success: true,
        data: {
          task,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedInput = updateTaskSchema.parse(req.body);
      const orgId = req.org!._id.toString();
      const taskId = Array.isArray(req.params.taskId) ? req.params.taskId[0] : req.params.taskId;

      const task = await TaskService.updateTask(orgId, taskId, validatedInput);

      res.status(200).json({
        success: true,
        data: {
          task,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async reorder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.org!._id.toString();
      const taskId = Array.isArray(req.params.taskId) ? req.params.taskId[0] : req.params.taskId;
      const { newColumnId, orderKey, version } = req.body;

      if (!newColumnId || !orderKey || typeof version !== 'number') {
        res.status(422).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'newColumnId, orderKey and version (number) are required.',
          },
        });
        return;
      }

      const task = await TaskService.reorderTask(orgId, taskId, { newColumnId, orderKey, version });

      res.status(200).json({
        success: true,
        data: {
          taskId: task._id,
          columnId: task.columnId,
          order: task.order,
          version: task.version,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.org!._id.toString();
      const taskId = Array.isArray(req.params.taskId) ? req.params.taskId[0] : req.params.taskId;

      const task = await TaskService.deleteTask(orgId, taskId);

      res.status(200).json({
        success: true,
        data: {
          message: 'Task deleted successfully.',
          task,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
