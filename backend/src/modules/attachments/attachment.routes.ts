import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { tenantContext } from '../../middleware/tenantContext.js';
import { AttachmentController } from './attachment.controller.js';

export const attachmentRouter = Router();

// All attachment routes require authentication and tenant workspace scope
attachmentRouter.use(authenticate);
attachmentRouter.use(tenantContext);

// Signature generation for direct-to-cloud upload (guests blocked)
attachmentRouter.post('/tasks/:taskId/attachments/signature', AttachmentController.getSignature);

// Registration of completed Cloudinary asset
attachmentRouter.post('/tasks/:taskId/attachments/complete', AttachmentController.complete);

// List attachments for a task
attachmentRouter.get('/tasks/:taskId/attachments', AttachmentController.list);
