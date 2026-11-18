import { z } from 'zod';

export const reorderTaskSchema = z.object({
  newColumnId: z.string().min(1, 'Target column is required'),
  orderKey: z.string().min(1, 'LexoRank order key is required'),
  version: z.number().int().positive('Optimistic concurrency version integer is required'),
});

export type ReorderTaskInput = z.infer<typeof reorderTaskSchema>;
