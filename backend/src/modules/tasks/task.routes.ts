import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { tenantContext } from '../../middleware/tenantContext.js';
import { TaskController } from './task.controller.js';

export const taskRouter = Router();

// All task routes require authentication and active tenant context
taskRouter.use(authenticate);
taskRouter.use(tenantContext);

// Project-scoped task creation and listing
taskRouter.post('/projects/:projectId/tasks', TaskController.create);
taskRouter.get('/projects/:projectId/tasks', TaskController.list);

// Task-specific inspection, mutation, and drag-and-drop reordering
taskRouter.get('/tasks/:taskId', TaskController.getById);
taskRouter.patch('/tasks/:taskId', TaskController.update);
taskRouter.patch('/tasks/:taskId/reorder', TaskController.reorder);
taskRouter.delete('/tasks/:taskId', TaskController.delete);
