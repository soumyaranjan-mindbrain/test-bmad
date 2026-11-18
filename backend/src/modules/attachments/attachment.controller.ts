import { Request, Response, NextFunction } from 'express';
import { AttachmentService } from './attachment.service.js';
import {
  requestUploadSignatureSchema,
  completeAttachmentUploadSchema,
} from './attachment.schemas.js';

export class AttachmentController {
  static async getSignature(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedInput = requestUploadSignatureSchema.parse(req.body);
      const orgId = req.org!._id.toString();
      const taskId = Array.isArray(req.params.taskId) ? req.params.taskId[0] : req.params.taskId;
      const userRole = req.membership!.role;

      const signatureData = await AttachmentService.generateUploadSignature(
        orgId,
        taskId,
        userRole,
        validatedInput
      );

      res.status(200).json({
        success: true,
        data: signatureData,
      });
    } catch (error) {
      next(error);
    }
  }

  static async complete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedInput = completeAttachmentUploadSchema.parse(req.body);
      const orgId = req.org!._id.toString();
      const taskId = Array.isArray(req.params.taskId) ? req.params.taskId[0] : req.params.taskId;
      const uploaderId = req.user!.userId;

      const attachment = await AttachmentService.completeUpload(
        orgId,
        taskId,
        uploaderId,
        validatedInput
      );

      res.status(201).json({
        success: true,
        data: {
          attachment,
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

      const attachments = await AttachmentService.listAttachments(orgId, taskId);

      res.status(200).json({
        success: true,
        data: {
          attachments,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
