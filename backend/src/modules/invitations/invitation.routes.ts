import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { tenantContext } from '../../middleware/tenantContext.js';
import { requireOrgRole } from '../../middleware/authorize.js';
import { InvitationController } from './invitation.controller.js';

export const invitationRouter = Router();

// All invitation routes require authenticated user session
invitationRouter.use(authenticate);

// Public/Member route to accept an invitation token
invitationRouter.post('/accept', InvitationController.accept);

// Tenant-scoped invitation management (requires x-organization-id + Admin/Owner role)
invitationRouter.post(
  '/',
  tenantContext,
  requireOrgRole('admin'),
  InvitationController.create
);

invitationRouter.get(
  '/',
  tenantContext,
  requireOrgRole('admin'),
  InvitationController.list
);
