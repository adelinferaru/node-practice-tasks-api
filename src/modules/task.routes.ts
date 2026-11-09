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

const controller = new TaskController(
  new TaskService(new InMemoryTaskRepository()),
);

export const taskRouter = Router();

taskRouter.get("/stats", controller.stats);

taskRouter.get("/", validateQuery(listTaskQuerySchema), controller.list);
taskRouter.post("/:id", validateBody(createTaskSchema), controller.create);
taskRouter.get("/:id", controller.getOne);
taskRouter.patch("/:id", validateBody(updateTaskSchema), controller.update);
taskRouter.delete("/:id", controller.remove);
