import { Request, Response, NextFunction } from 'express';
import { InvitationService } from './invitation.service.js';
import { createInvitationSchema, acceptInvitationSchema } from './invitation.schemas.js';

export class InvitationController {
  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedInput = createInvitationSchema.parse(req.body);
      const orgId = req.org!._id.toString();
      const userId = req.user!.userId;

      const invitation = await InvitationService.createInvitation(orgId, userId, validatedInput);

      res.status(201).json({
        success: true,
        data: {
          invitation: {
            id: invitation._id,
            email: invitation.email,
            role: invitation.role,
            status: invitation.status,
            expiresAt: invitation.expiresAt,
            inviteLink: `${process.env.CLIENT_ORIGIN || 'http://localhost:5173'}/invite/accept?token=${invitation.token}`,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async accept(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedInput = acceptInvitationSchema.parse(req.body);
      const userId = req.user!.userId;

      const result = await InvitationService.acceptInvitation(userId, validatedInput);

      res.status(200).json({
        success: true,
        data: {
          message: 'Invitation accepted successfully. Welcome to the organization!',
          organizationId: result.organizationId,
          membership: result.membership,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.org!._id.toString();
      const invitations = await InvitationService.listInvitations(orgId);

      res.status(200).json({
        success: true,
        data: {
          invitations,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
