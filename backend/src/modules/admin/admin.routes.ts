import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { requireSuperAdmin } from '../../middleware/requireSuperAdmin.js';
import { AdminController } from './admin.controller.js';

export const adminRouter = Router();

// Global Super Admin control plane routes
adminRouter.use(authenticate);
adminRouter.use(requireSuperAdmin);

adminRouter.get('/admin/telemetry', AdminController.getTelemetry);
adminRouter.get('/admin/tenants', AdminController.listTenants);
adminRouter.post('/admin/tenants/:id/suspend', AdminController.suspendTenant);
adminRouter.post('/admin/tenants/:id/reactivate', AdminController.reactivateTenant);
