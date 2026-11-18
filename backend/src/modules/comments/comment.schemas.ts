import { z } from 'zod';

export const createCommentSchema = z.object({
  text: z.string().min(1, 'Comment text cannot be empty').max(5000).trim(),
  isInternal: z.boolean().default(false),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
