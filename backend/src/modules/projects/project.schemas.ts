import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z.string().min(2, 'Project name must be at least 2 characters').max(100).trim(),
  key: z
    .string()
    .min(2, 'Project key must be at least 2 characters')
    .max(10, 'Project key must be at most 10 characters')
    .regex(/^[A-Z0-9]+$/, 'Project key must be uppercase alphanumeric (e.g. ACME, APP)')
    .trim(),
  description: z.string().max(1000).optional(),
  targetDeliveryDate: z.string().datetime().optional().transform(val => (val ? new Date(val) : undefined)),
});

export const updateProjectSchema = z.object({
  name: z.string().min(2).max(100).trim().optional(),
  description: z.string().max(1000).optional(),
  targetDeliveryDate: z.string().datetime().optional().transform(val => (val ? new Date(val) : undefined)),
  columns: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        order: z.number(),
        wipLimit: z.number().optional(),
      })
    )
    .optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
