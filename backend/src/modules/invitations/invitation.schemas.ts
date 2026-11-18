import { z } from 'zod';

export const createInvitationSchema = z.object({
  email: z.string().email('Valid email is required').toLowerCase().trim(),
  role: z.enum(['admin', 'member', 'guest'], {
    errorMap: () => ({ message: "Role must be 'admin', 'member', or 'guest'" }),
  }),
});

export const acceptInvitationSchema = z.object({
  token: z.string().min(10, 'Invitation token is required'),
});

export type CreateInvitationInput = z.infer<typeof createInvitationSchema>;
export type AcceptInvitationInput = z.infer<typeof acceptInvitationSchema>;
