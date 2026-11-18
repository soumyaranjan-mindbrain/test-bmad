import crypto from 'crypto';
import { Invitation } from '../../models/Invitation.js';
import { OrganizationMember } from '../../models/OrganizationMember.js';
import { User } from '../../models/User.js';
import { AppError } from '../../utils/errors.js';
import { CreateInvitationInput, AcceptInvitationInput } from './invitation.schemas.js';

const FREE_PLAN_MAX_MEMBERS = 5;

export class InvitationService {
  static async createInvitation(orgId: string, invitedByUserId: string, input: CreateInvitationInput) {
    // 1. Quota Check (Free tier maximum 5 active members + pending invitations)
    const activeMembersCount = await OrganizationMember.countDocuments({
      organizationId: orgId,
      status: 'active',
    });

    const pendingInvitesCount = await Invitation.countDocuments({
      organizationId: orgId,
      status: 'pending',
    });

    if (activeMembersCount + pendingInvitesCount >= FREE_PLAN_MAX_MEMBERS) {
      throw new AppError(
        `Organization member quota reached (Maximum ${FREE_PLAN_MAX_MEMBERS} seats on Free plan). Please upgrade to Pro for unlimited members.`,
        402,
        'MEMBER_QUOTA_EXCEEDED'
      );
    }

    // 2. Check if user is already an active member
    const existingUser = await User.findOne({ email: input.email });
    if (existingUser) {
      const existingMember = await OrganizationMember.findOne({
        organizationId: orgId,
        userId: existingUser._id,
        status: 'active',
      });
      if (existingMember) {
        throw new AppError('This user is already an active member of this organization.', 409, 'ALREADY_MEMBER');
      }
    }

    // 3. Invalidate previous pending invitation if exists
    await Invitation.updateMany(
      { organizationId: orgId, email: input.email, status: 'pending' },
      { status: 'revoked' }
    );

    // 4. Create cryptographically secure invitation token (72 hours TTL)
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000);

    const invitation = await Invitation.create({
      organizationId: orgId,
      email: input.email,
      role: input.role,
      invitedBy: invitedByUserId,
      token,
      status: 'pending',
      expiresAt,
    });

    return invitation;
  }

  static async acceptInvitation(userId: string, input: AcceptInvitationInput) {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found.', 404, 'USER_NOT_FOUND');
    }

    const invitation = await Invitation.findOne({
      token: input.token,
      status: 'pending',
    });

    if (!invitation) {
      throw new AppError('Invalid or expired invitation token.', 404, 'INVALID_INVITATION');
    }

    if (invitation.expiresAt < new Date()) {
      invitation.status = 'expired';
      await invitation.save();
      throw new AppError('This invitation link has expired. Please request a new invite.', 410, 'INVITATION_EXPIRED');
    }

    // Bind user to organization as OrganizationMember
    const membership = await OrganizationMember.findOneAndUpdate(
      { organizationId: invitation.organizationId, userId: user._id },
      {
        organizationId: invitation.organizationId,
        userId: user._id,
        role: invitation.role,
        status: 'active',
        joinedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    invitation.status = 'accepted';
    await invitation.save();

    return {
      organizationId: invitation.organizationId,
      membership,
    };
  }

  static async listInvitations(orgId: string) {
    return Invitation.find({ organizationId: orgId, status: 'pending' })
      .populate('invitedBy', 'fullName email')
      .sort({ createdAt: -1 });
  }
}
