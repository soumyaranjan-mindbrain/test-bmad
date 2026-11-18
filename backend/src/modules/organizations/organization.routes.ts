import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { tenantContext } from '../../middleware/tenantContext.js';
import { OrganizationController } from './organization.controller.js';

export const organizationRouter = Router();

// All organization routes require authenticated user
organizationRouter.use(authenticate);

// Global user workspace listing & workspace creation
organizationRouter.get('/', OrganizationController.listUserOrganizations);
organizationRouter.post('/', OrganizationController.create);

// Active tenant-scoped routes (require x-organization-id header)
organizationRouter.get('/current', tenantContext, OrganizationController.getCurrent);
