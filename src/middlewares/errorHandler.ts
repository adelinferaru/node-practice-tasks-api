import { AppError } from "../lib/errors";
import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export const notFound = (req: Request, _res: Response, next: NextFunction) => {
  next(new AppError(404, "NOT_FOUND", `Route ${req.method} ${req.path} not found`));
};

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (err instanceof ZodError) {
    const details = err.issues.map((i) => ({
      path: i.path.join("."),
      message: i.message,
    }));
    err = new AppError(400, "VALIDATION_ERROR", "Invalid request", details);
  } else if ((err as { type?: string })?.type === "entity.parse.failed") {
    err = new AppError(400, "INVALID_JSON", "Request body is not valid JSON");
  }

  if (err instanceof AppError) {
    return res.status(err.status).json(err.toBody());
  }

  console.error(err);
  // ...but send the client a generic 500 — never leak stack traces or internals.
  res
    .status(500)
    .json(new AppError(500, "INTERNAL_ERROR", "Internal Server Error").toBody());
};
