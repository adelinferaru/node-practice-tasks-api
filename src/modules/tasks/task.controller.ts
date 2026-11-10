import { Request, Response } from "express";
import { TaskService } from "./task.service";
import { ListTaskQuery } from "./task.schema";
import {
  toTaskResponse,
  type TaskListResponse,
  type TaskResponse,
  type TaskStatsResponse,
} from "./task.dto";

// Response<T> makes TypeScript check every res.json() against the response DTO,
// so the controller can't send the internal Task model by mistake.
export class TaskController {
  constructor(private readonly service: TaskService) {}

  create = (req: Request, res: Response<TaskResponse>): void => {
    const task = this.service.create(req.body);

    res.status(201).location(`/api/tasks/${task.id}`).json(toTaskResponse(task));
  };

  list = (_req: Request, res: Response<TaskListResponse>) => {
    const { data, meta } = this.service.list(res.locals.query as ListTaskQuery);
    res.json({ data: data.map(toTaskResponse), meta });
  };

  // Request<{ id: string }> types req.params — URL params are always strings.
  getOne = (req: Request<{ id: string }>, res: Response<TaskResponse>) => {
    // service throws 404 if unknown
    res.json(toTaskResponse(this.service.getById(req.params.id)));
  };

  update = (req: Request<{ id: string }>, res: Response<TaskResponse>) => {
    res.json(toTaskResponse(this.service.update(req.params.id, req.body)));
  };

  remove = (req: Request<{ id: string }>, res: Response) => {
    this.service.remove(req.params.id);
    // 204 No Content: success with nothing to say — .end(), not .json().
    res.status(204).end();
  };

  stats = (_req: Request, res: Response<TaskStatsResponse>) => {
    res.json(this.service.stats());
  };
}
