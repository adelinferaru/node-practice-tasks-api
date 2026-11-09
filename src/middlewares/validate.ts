import { z } from "zod";
import type { RequestHandler, Request, Response, NextFunction } from "express";

export const validateBody =
  (schema: z.ZodType): RequestHandler =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) return next(result.error);

    req.body = result.data;

    next();
  };

export const validateQuery =
  (schema: z.ZodType): RequestHandler =>
  (req, res, next) => {
    const result = schema.safeParse(req.query);

    if (!result.success) return next(result.error);

    res.locals.query = result.data;

    next();
  };
