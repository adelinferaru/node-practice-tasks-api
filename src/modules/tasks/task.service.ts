import { randomUUID } from "node:crypto";
import { AppError, NotFoundError } from "../../lib/errors";
import type { TaskRepository } from "./task.repository";
import type {
  CreateTaskInput,
  UpdateTaskInput,
  Task,
  Status,
  ListTaskQuery,
} from "./task.schema";

export class TaskService {
  constructor(private readonly repo: TaskRepository) {}

  create(input: CreateTaskInput): Task {
    const now = new Date();
    return this.repo.save({
      ...input,
      id: randomUUID(),
      createdAt: now,
      updatedAt: now,
    });
  }

  getById(id: string): Task {
    const task = this.repo.findById(id);
    if (!task) {
      throw new NotFoundError("Task", id);
    }

    return task;
  }

  list(q: ListTaskQuery) {
    let items = this.repo.findAll();
    if (q.status) items = items.filter((i) => i.status === q.status);
    if (q.priority) items = items.filter((i) => i.priority === q.priority);

    items.sort((a, b) => {
      switch (q.sort) {
        case "createdAt":
          return a.createdAt.getTime() - b.createdAt.getTime();
        case "-createdAt":
          return b.createdAt.getTime() - a.createdAt.getTime();
        case "dueDate":
          return (
            (a.dueDate?.getTime() ?? Infinity) -
            (b.dueDate?.getTime() ?? Infinity)
          );
      }
    });

    const total = items.length;
    const start = (q.page - 1) * q.limit;
    return {
      data: items.slice(start, start + q.limit),
      meta: {
        page: q.page,
        limit: q.limit,
        total,
        totalPages: Math.ceil(total / q.limit),
      },
    };
  }

  private canTransition(from: Status, to: Status): boolean {
    return !(from === "done" && to === "todo");
  }

  update(id: string, input: UpdateTaskInput): Task {
    const task = this.getById(id);
    if (input.status && !this.canTransition(task.status, input.status)) {
      throw new AppError(
        409,
        `Cannot change status from ${task.status} to ${input.status}`,
      );
    }
    return this.repo.save({ ...task, ...input, updatedAt: new Date() });
  }

  remove(id: string): void {
    if (!this.repo.delete(id)) throw new NotFoundError("Task", id);
  }

  stats(): Record<Status, number> {
    const counts: Record<Status, number> = { todo: 0, in_progress: 0, done: 0 };
    for (const t of this.repo.findAll()) counts[t.status]++;
    return counts;
  }
}
