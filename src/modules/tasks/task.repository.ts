import type { Task } from "./task.schema";

export interface TaskRepository {
  findAll(): Task[];
  findById(id: string): Task | undefined;
  save(task: Task): Task;
  delete(id: string): boolean;
}

export class InMemoryTaskRepository implements TaskRepository {
  private readonly tasks = new Map<string, Task>();

  findAll(): Task[] {
    return [...this.tasks.values()];
  }

  findById(id: string): Task | undefined {
    return this.tasks.get(id);
  }

  save(task: Task): Task {
    this.tasks.set(task.id, task);

    return task;
  }

  delete(id: string): boolean {
    return this.tasks.delete(id);
  }
}
