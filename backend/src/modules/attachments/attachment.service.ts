import crypto from 'crypto';
import { TaskAttachment } from '../../models/TaskAttachment.js';
import { Task } from '../../models/Task.js';
import { AppError } from '../../utils/errors.js';
import { getIO } from '../../real-time/socketServer.js';
import { RequestUploadSignatureInput, CompleteAttachmentUploadInput } from './attachment.schemas.js';

export class AttachmentService {
  static async generateUploadSignature(
    orgId: string,
    taskId: string,
    userRole: string,
    input: RequestUploadSignatureInput
  ) {
    // 1. Role Guard: Guests cannot upload attachments
    if (userRole === 'guest') {
      throw new AppError('Guests are not permitted to upload attachments.', 403, 'FORBIDDEN');
    }

    const task = await Task.findOne({
      _id: taskId,
      organizationId: orgId,
      isDeleted: false,
    });

    if (!task) {
      throw new AppError('Task not found in this organization.', 404, 'TASK_NOT_FOUND');
    }

    // 2. Generate HMAC-SHA1 signature for Cloudinary Direct Upload
    const timestamp = Math.round(new Date().getTime() / 1000);
    const folder = `taskflow/${orgId}/${taskId}`;
    const apiSecret = process.env.CLOUDINARY_API_SECRET || 'dev_cloudinary_secret';
    const apiKey = process.env.CLOUDINARY_API_KEY || 'dev_cloudinary_key';
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'taskflow-dev';

    // Signature payload parameters in alphabetical order
    const paramsToSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash('sha1').update(paramsToSign).digest('hex');

    return {
      signature,
      timestamp,
      apiKey,
      cloudName,
      folder,
      uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
      maxFileSize: 10 * 1024 * 1024,
    };
  }

  static async completeUpload(
    orgId: string,
    taskId: string,
    uploaderId: string,
    input: CompleteAttachmentUploadInput
  ) {
    const task = await Task.findOne({
      _id: taskId,
      organizationId: orgId,
      isDeleted: false,
    });

    if (!task) {
      throw new AppError('Task not found in this organization.', 404, 'TASK_NOT_FOUND');
    }

    const attachment = await TaskAttachment.create({
      organizationId: orgId,
      projectId: task.projectId,
      taskId: task._id,
      uploaderId,
      fileName: input.fileName,
      fileSize: input.fileSize,
      mimeType: input.mimeType,
      cloudinaryPublicId: input.cloudinaryPublicId,
      secureUrl: input.secureUrl,
    });

    // Real-Time Broadcast to Task Room
    try {
      getIO().to(`task:${taskId}`).emit('attachment:uploaded', {
        taskId,
        attachment,
      });
    } catch {
      // Ignore in standalone tests
    }

    return attachment;
  }

  static async listAttachments(orgId: string, taskId: string) {
    return TaskAttachment.find({
      organizationId: orgId,
      taskId,
    })
      .populate('uploaderId', 'fullName email avatarUrl')
      .sort({ createdAt: -1 });
  }
}
