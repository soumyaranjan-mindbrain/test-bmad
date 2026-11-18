import { z } from 'zod';

export const startTimerSchema = z.object({
  taskId: z.string().min(1, 'Task ID is required'),
  isBillable: z.boolean().default(true),
  notes: z.string().optional(),
});

export const stopTimerSchema = z.object({
  notes: z.string().optional(),
});

export const manualTimeEntrySchema = z.object({
  taskId: z.string().min(1, 'Task ID is required'),
  date: z.string().datetime().optional().transform(v => (v ? new Date(v) : new Date())),
  durationMinutes: z.number().int().positive('Duration must be at least 1 minute'),
  isBillable: z.boolean().default(true),
  notes: z.string().optional(),
});

export type StartTimerInput = z.infer<typeof startTimerSchema>;
export type StopTimerInput = z.infer<typeof stopTimerSchema>;
export type ManualTimeEntryInput = z.infer<typeof manualTimeEntrySchema>;
