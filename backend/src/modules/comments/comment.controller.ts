import { Request, Response, NextFunction } from 'express';
import { CommentService } from './comment.service.js';
import { createCommentSchema } from './comment.schemas.js';

export class CommentController {
  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedInput = createCommentSchema.parse(req.body);
      const orgId = req.org!._id.toString();
      const taskId = Array.isArray(req.params.taskId) ? req.params.taskId[0] : req.params.taskId;
      const authorId = req.user!.userId;
      const userRole = req.membership!.role;

      const comment = await CommentService.createComment(
        orgId,
        taskId,
        authorId,
        userRole,
        validatedInput
      );

      res.status(201).json({
        success: true,
        data: {
          comment,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.org!._id.toString();
      const taskId = Array.isArray(req.params.taskId) ? req.params.taskId[0] : req.params.taskId;
      const isGuest = req.membership!.role === 'guest';

      const comments = await CommentService.listComments(orgId, taskId, isGuest);

      res.status(200).json({
        success: true,
        data: {
          comments,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
