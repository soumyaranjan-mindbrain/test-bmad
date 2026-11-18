import { z } from 'zod';

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required').max(255).trim(),
  description: z.string().optional(),
  columnId: z.string().default('todo'),
  status: z.enum(['backlog', 'todo', 'in_progress', 'review', 'done']).default('todo'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  assigneeId: z.string().optional(),
  labels: z.array(z.string()).default([]),
  storyPoints: z.number().positive().optional(),
  startDate: z.string().datetime().optional().transform(v => (v ? new Date(v) : undefined)),
  dueDate: z.string().datetime().optional().transform(v => (v ? new Date(v) : undefined)),
  estimatedHours: z.number().positive().optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(255).trim().optional(),
  description: z.string().optional(),
  columnId: z.string().optional(),
  status: z.enum(['backlog', 'todo', 'in_progress', 'review', 'done']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  assigneeId: z.string().nullable().optional(),
  labels: z.array(z.string()).optional(),
  storyPoints: z.number().positive().nullable().optional(),
  startDate: z.string().datetime().nullable().optional().transform(v => (v ? new Date(v) : undefined)),
  dueDate: z.string().datetime().nullable().optional().transform(v => (v ? new Date(v) : undefined)),
  estimatedHours: z.number().positive().nullable().optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
