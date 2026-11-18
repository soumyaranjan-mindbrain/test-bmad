import { z } from 'zod';

export const createDependencySchema = z.object({
  predecessorTaskId: z.string().min(1, 'Predecessor task ID is required'),
});

export type CreateDependencyInput = z.infer<typeof createDependencySchema>;
