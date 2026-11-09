import express from "express";
import { config } from "./config";
import { errorHandler, notFound } from "./middlewares/errorHandler";
import { taskRouter } from "./modules/task.routes";

export function createApp() {
  const app = express();

  app.get("/health", (_req, res) => {
    res.json({ status: "ok", uptime: process.uptime() });
  });

  app.use("/api/tasks", taskRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
