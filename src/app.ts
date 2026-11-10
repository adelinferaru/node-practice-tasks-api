import express from "express";
import swaggerUi from "swagger-ui-express";
import { config } from "./config";
import { errorHandler, notFound } from "./middlewares/errorHandler";
import { createTaskRouter } from "./modules/tasks/task.routes";
import { openApiDocument } from "./docs/openapi";

export function createApp() {
  const app = express();

  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ status: "ok", uptime: process.uptime() });
  });

  app.use("/api/tasks", createTaskRouter());

  // API description: raw OpenAPI JSON for tools, Swagger UI for humans.
  app.get("/openapi.json", (_req, res) => {
    res.json(openApiDocument);
  });
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
