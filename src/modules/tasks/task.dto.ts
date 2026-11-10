// Response DTOs: the PUBLIC shape of a task, kept separate from the internal `Task` model.
//
// Why: the controller never sends `Task` straight to res.json(). If `Task` gains an internal
// field later (ownerId, deletedAt, ...), it can't leak to clients by accident: a field
// appears in the API only when it's added here on purpose. These schemas also feed the
// OpenAPI spec (src/docs/openapi.ts), so the docs describe exactly what we send.
import { z } from "zod";
import { TaskPriority, TaskStatus, type Task } from "./task.schema";

// strictObject: the contract test fails if the response contains anything extra.
export const taskResponseSchema = z.strictObject({
  id: z.uuid(),
  title: z.string(),
  description: z.string().optional(),
  status: TaskStatus,
  priority: TaskPriority,
  dueDate: z.iso.datetime().optional(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export const taskListResponseSchema = z.strictObject({
  data: z.array(taskResponseSchema),
  meta: z.strictObject({
    page: z.number().int(),
    limit: z.number().int(),
    total: z.number().int(),
    totalPages: z.number().int(),
  }),
});

export const taskStatsResponseSchema = z.strictObject({
  todo: z.number().int(),
  in_progress: z.number().int(),
  done: z.number().int(),
});

export type TaskResponse = z.infer<typeof taskResponseSchema>;
export type TaskListResponse = z.infer<typeof taskListResponseSchema>;
export type TaskStatsResponse = z.infer<typeof taskStatsResponseSchema>;

// The single place that decides how an internal Task becomes a public TaskResponse.
export function toTaskResponse(task: Task): TaskResponse {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    dueDate: task.dueDate?.toISOString(),
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  };
}
