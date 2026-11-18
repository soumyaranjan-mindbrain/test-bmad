import { z } from 'zod';

export const createOrganizationSchema = z.object({
  name: z.string().min(2, 'Organization name must be at least 2 characters').max(100).trim(),
  slug: z
    .string()
    .min(2, 'Slug must be at least 2 characters')
    .max(50)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric and may contain hyphens only')
    .trim(),
  logoUrl: z.string().url().optional(),
});

export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;
