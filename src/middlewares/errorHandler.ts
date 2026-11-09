import { AppError, NotFoundError } from "../lib/errors";
import type {
  ErrorRequestHandler,
  RequestHandler,
  Request,
  Response,
  NextFunction,
} from "express";
import { ZodError } from "zod";

export const notFound = (req: Request, res: Response) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
};

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: "ValidationError",
      details: err.issues.map((i) => ({
        path: i.path.join("."),
        message: i.message,
      })),
    });
  }

  if (err instanceof AppError) {
    return res.status(err.status).json({
      error: err.message,
      details: err.details,
    });
  }

  //   if (err?.type === "entity.parse.failed") {
  //     return res.status(400).json({ error: "Malformed JSON" });
  //   }

  console.error(err);
  // ...but send the client a generic 500 — never leak stack traces or internals.
  res.status(500).json({ error: "Internal Server Error" });
};
