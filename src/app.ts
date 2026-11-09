import express from "express";
import { config } from "./config";
import { errorHandler, notFound } from "./middlewares/errorHandler";
import { createTaskRouter } from "./modules/task.routes";

export function createApp() {
  const app = express();

  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ status: "ok", uptime: process.uptime() });
  });

  app.use("/api/tasks", createTaskRouter());

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
