import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { tenantContext } from '../../middleware/tenantContext.js';
import { requireOrgRole } from '../../middleware/authorize.js';
import { ProjectController } from './project.controller.js';

export const projectRouter = Router();

// All project routes require authentication and tenant workspace scope
projectRouter.use(authenticate);
projectRouter.use(tenantContext);

// Project Hub & Catalog
projectRouter.get('/', ProjectController.list);
projectRouter.post('/', requireOrgRole('member'), ProjectController.create);

// Project Specific Operations
projectRouter.get('/:projectId', ProjectController.getById);
projectRouter.patch('/:projectId', requireOrgRole('admin'), ProjectController.update);
projectRouter.delete('/:projectId', requireOrgRole('admin'), ProjectController.archive);
