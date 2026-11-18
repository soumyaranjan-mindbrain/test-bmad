import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { tenantContext } from '../../middleware/tenantContext.js';
import { DependencyController } from './dependency.controller.js';

export const dependencyRouter = Router();

// All dependency routes require authentication and tenant workspace scope
dependencyRouter.use(authenticate);
dependencyRouter.use(tenantContext);

dependencyRouter.post('/tasks/:taskId/dependencies', DependencyController.add);
dependencyRouter.get('/tasks/:taskId/dependencies', DependencyController.get);
dependencyRouter.delete('/tasks/:taskId/dependencies/:predecessorId', DependencyController.remove);
