import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { tenantContext } from '../../middleware/tenantContext.js';
import { CommentController } from './comment.controller.js';

export const commentRouter = Router();

// All comment routes require authenticated session & tenant workspace scope
commentRouter.use(authenticate);
commentRouter.use(tenantContext);

commentRouter.post('/tasks/:taskId/comments', CommentController.create);
commentRouter.get('/tasks/:taskId/comments', CommentController.list);
