import { Request, Response } from "express";
import { TaskService } from "./task.service";
import { ListTaskQuery } from "./task.schema";

export class TaskController {
  constructor(private readonly service: TaskService) {}

  create = (req: Request, res: Response): void => {
    const task = this.service.create(req.body);

    res.status(201).location(`/api/tasks/${task.id}`).json(task);
  };

  list = (req: Request, res: Response) => {
    res.json(this.service.list(res.locals.query as ListTaskQuery));
  };

  // Request<{ id: string }> types req.params — URL params are always strings.
  getOne = (req: Request<{ id: string }>, res: Response) => {
    res.json(this.service.getById(req.params.id)); // service throws 404 if unknown
  };

  update = (req: Request<{ id: string }>, res: Response) => {
    res.json(this.service.update(req.params.id, req.body));
  };

  remove = (req: Request<{ id: string }>, res: Response) => {
    this.service.remove(req.params.id);
    // 204 No Content: success with nothing to say — .end(), not .json().
    res.status(204).end();
  };

  stats = (_req: Request, res: Response) => {
    res.json(this.service.stats());
  };
}
