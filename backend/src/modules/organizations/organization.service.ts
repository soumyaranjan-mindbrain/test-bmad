import { Organization } from '../../models/Organization.js';
import { OrganizationMember } from '../../models/OrganizationMember.js';
import { AppError } from '../../utils/errors.js';
import { CreateOrganizationInput } from './organization.schemas.js';

export class OrganizationService {
  static async createOrganization(userId: string, input: CreateOrganizationInput) {
    const existingSlug = await Organization.findOne({ slug: input.slug });
    if (existingSlug) {
      throw new AppError('This workspace URL slug is already taken. Please choose another.', 409, 'SLUG_ALREADY_EXISTS');
    }

    // 1. Create Organization document
    const org = await Organization.create({
      name: input.name,
      slug: input.slug,
      logoUrl: input.logoUrl,
      ownerId: userId,
      status: 'active',
    });

    // 2. Set creator as Organization Owner
    const membership = await OrganizationMember.create({
      organizationId: org._id,
      userId,
      role: 'owner',
      status: 'active',
    });

    return {
      organization: org,
      membership,
    };
  }

  static async getUserOrganizations(userId: string) {
    const memberships = await OrganizationMember.find({
      userId,
      status: 'active',
    }).populate('organizationId');

    return memberships
      .filter(m => m.organizationId && !(m.organizationId as unknown as { isDeleted: boolean }).isDeleted)
      .map(m => ({
        role: m.role,
        joinedAt: m.joinedAt,
        organization: m.organizationId,
      }));
  }

  static async getOrganizationById(orgId: string) {
    const org = await Organization.findOne({ _id: orgId, isDeleted: false });
    if (!org) {
      throw new AppError('Organization not found.', 404, 'ORGANIZATION_NOT_FOUND');
    }
    return org;
  }
}
