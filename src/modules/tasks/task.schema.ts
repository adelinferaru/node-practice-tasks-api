import { z } from "zod";

export const TaskStatus = z.enum(["todo", "in_progress", "done"]);
export const TaskPriority = z.enum(["low", "medium", "high"]);

const taskFields = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(2000).optional(),
  status: TaskStatus,
  priority: TaskPriority,
  // Only ISO strings: "2026-12-01" or "2026-12-01T10:00:00Z". Rejects null, numbers, "tomorrow".
  dueDate: z
    .union([z.iso.date(), z.iso.datetime({ offset: true })])
    .transform((s) => new Date(s))
    .optional(),
});

export const createTaskSchema = taskFields.extend({
  status: TaskStatus.default("todo"),
  priority: TaskPriority.default("medium"),
});

export const updateTaskSchema = taskFields
  .partial()
  .refine((v) => Object.keys(v).length > 0, {
    message: "Body must contain at least one field",
  });

export const listTaskQuerySchema = z.object({
  status: TaskStatus.optional(),
  priority: TaskPriority.optional(),
  sort: z.enum(["createdAt", "-createdAt", "dueDate"]).default("-createdAt"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type ListTaskQuery = z.infer<typeof listTaskQuerySchema>;
export type Status = z.infer<typeof TaskStatus>;

export interface Task extends CreateTaskInput {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}
