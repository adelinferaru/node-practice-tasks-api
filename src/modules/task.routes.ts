import { Router } from "express";
import { validateBody, validateQuery } from "../middlewares/validate";
import { InMemoryTaskRepository } from "./tasks/task.repository";
import { TaskService } from "./tasks/task.service";
import { TaskController } from "./tasks/task.controller";
import {
  createTaskSchema,
  updateTaskSchema,
  listTaskQuerySchema,
} from "./tasks/task.schema";

// A factory, not a module-level singleton: every createApp() call gets its own
// in-memory store, so tests (and multiple app instances) never share tasks.
export function createTaskRouter(): Router {
  const controller = new TaskController(
    new TaskService(new InMemoryTaskRepository()),
  );

  const router = Router();

  router.get("/stats", controller.stats);

  router.get("/", validateQuery(listTaskQuerySchema), controller.list);
  router.post("/", validateBody(createTaskSchema), controller.create);
  router.get("/:id", controller.getOne);
  router.patch("/:id", validateBody(updateTaskSchema), controller.update);
  router.delete("/:id", controller.remove);

  return router;
}
