"use client"

import { z } from "zod"

import { TaskStatus } from "./dbInterface"

const userSchema = z.object({
  _id: z.string(),
  name: z.string().nullable(),
  email: z.string().email().optional()
})

// Create a Zod enum from the TaskStatus values
const taskStatusValues = Object.values(TaskStatus) as [string, ...string[]]

export const TaskFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  dueDate: z.date().optional(),
  status: z.enum(taskStatusValues as [TaskStatus, ...TaskStatus[]]).optional(),
  assignee: userSchema.optional(),
  projectId: z.string().optional(),
  boardId: z.string().optional()
})
