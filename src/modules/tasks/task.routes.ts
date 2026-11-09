import { Router } from "express";
import { validateBody, validateQuery } from "../../middlewares/validate";
import { InMemoryTaskRepository } from "./task.repository";
import { TaskService } from "./task.service";
import { TaskController } from "./task.controller";
import {
  createTaskSchema,
  updateTaskSchema,
  listTaskQuerySchema,
} from "./task.schema";

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
