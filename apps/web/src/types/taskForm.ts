'use client';

import { z } from 'zod';

const userSchema = z.object({
  _id: z.string(),
  name: z.string().nullable()
});

export const TaskFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  dueDate: z.date().optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']).optional(),
  assignee: userSchema.optional()
});
