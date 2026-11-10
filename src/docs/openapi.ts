// OpenAPI 3.1 description of the API, GENERATED from the same Zod schemas that
// validate requests and shape responses. Docs and behaviour can't drift apart:
// change a schema and both the validation and the docs change with it.
//
// Served as JSON at /openapi.json and as a Swagger UI page at /docs (see app.ts).
import { z } from "zod";
import {
  createTaskSchema,
  listTaskQuerySchema,
  updateTaskSchema,
} from "../modules/tasks/task.schema";
import {
  taskListResponseSchema,
  taskResponseSchema,
  taskStatsResponseSchema,
} from "../modules/tasks/task.dto";

type JsonSchema = Record<string, unknown>;

// Zod adds a full regex next to `format: date/date-time` and MAX_SAFE_INTEGER bounds
// to ints. Both are correct but unreadable in docs, so we tidy them away.
function tidy(node: unknown): unknown {
  if (Array.isArray(node)) return node.map(tidy);
  if (node && typeof node === "object") {
    const out: JsonSchema = {};
    for (const [key, value] of Object.entries(node)) {
      if (key === "$schema") continue;
      if (key === "pattern" && "format" in node) continue;
      if (Math.abs(value as number) === Number.MAX_SAFE_INTEGER) continue;
      out[key] = tidy(value);
    }
    return out;
  }
  return node;
}

// io: "input"  = what a client may SEND (defaults make fields optional, transforms ignored)
// io: "output" = what the server SENDS back
const input = (s: z.ZodType) => tidy(z.toJSONSchema(s, { io: "input" })) as JsonSchema;
const output = (s: z.ZodType) => tidy(z.toJSONSchema(s, { io: "output" })) as JsonSchema;

const ref = (name: string) => ({ $ref: `#/components/schemas/${name}` });
const json = (schema: unknown, example?: unknown) => ({
  content: { "application/json": { schema, ...(example !== undefined && { example }) } },
});
const errorResponse = (name: string) => ({ $ref: `#/components/responses/${name}` });

const errorExample = (code: string, message: string, details?: unknown) => ({
  error: { code, message, ...(details !== undefined && { details }) },
});

// Query parameters for GET /api/tasks, one per field of listTaskQuerySchema.
const listParameters = Object.entries(listTaskQuerySchema.shape).map(
  ([name, schema]) => ({ name, in: "query", required: false, schema: input(schema) }),
);

const idParameter = {
  name: "id",
  in: "path",
  required: true,
  description: "Task id (UUID)",
  schema: { type: "string", format: "uuid" },
};

const exampleTask = {
  id: "3f1c2b7e-8a4d-4c6e-9b1a-2d5e7f9a0c3b",
  title: "Prepare interview",
  description: "Review Express error handling",
  status: "todo",
  priority: "high",
  dueDate: "2026-12-01T00:00:00.000Z",
  createdAt: "2026-11-10T09:00:00.000Z",
  updatedAt: "2026-11-10T09:00:00.000Z",
};

export const openApiDocument = {
  openapi: "3.1.0",
  info: {
    title: "Tasks API (practice project)",
    version: "1.0.0",
    description:
      "🎓 Learning project: a REST API to manage tasks, built with Node.js, Express 5, TypeScript and Zod. " +
      "Data is stored in memory and resets on every restart.\n\n" +
      "Every error response has the shape `{ error: { code, message, details? } }`.",
  },
  tags: [{ name: "Tasks" }, { name: "System" }],
  paths: {
    "/health": {
      get: {
        tags: ["System"],
        summary: "Health check",
        responses: {
          200: {
            description: "Server is up",
            ...json(
              {
                type: "object",
                properties: { status: { type: "string" }, uptime: { type: "number" } },
              },
              { status: "ok", uptime: 12.34 },
            ),
          },
        },
      },
    },
    "/api/tasks": {
      get: {
        tags: ["Tasks"],
        summary: "List tasks",
        description: "Filter by status/priority, sort, and paginate (limit max 100).",
        parameters: listParameters,
        responses: {
          200: {
            description: "A page of tasks",
            ...json(ref("TaskList"), {
              data: [exampleTask],
              meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
            }),
          },
          400: errorResponse("ValidationError"),
        },
      },
      post: {
        tags: ["Tasks"],
        summary: "Create a task",
        requestBody: {
          required: true,
          ...json(ref("CreateTask"), {
            title: "Prepare interview",
            priority: "high",
            dueDate: "2026-12-01",
          }),
        },
        responses: {
          201: {
            description: "Task created",
            headers: {
              Location: {
                description: "URL of the new task",
                schema: { type: "string" },
              },
            },
            ...json(ref("Task"), exampleTask),
          },
          400: errorResponse("ValidationError"),
        },
      },
    },
    "/api/tasks/stats": {
      get: {
        tags: ["Tasks"],
        summary: "Count tasks per status",
        responses: {
          200: {
            description: "Counts per status",
            ...json(ref("TaskStats"), { todo: 3, in_progress: 1, done: 2 }),
          },
        },
      },
    },
    "/api/tasks/{id}": {
      parameters: [idParameter],
      get: {
        tags: ["Tasks"],
        summary: "Get one task",
        responses: {
          200: { description: "The task", ...json(ref("Task"), exampleTask) },
          404: errorResponse("NotFound"),
        },
      },
      patch: {
        tags: ["Tasks"],
        summary: "Partially update a task",
        description:
          "Send at least one field. Business rule: a task that is `done` cannot go back to `todo` (409).",
        requestBody: {
          required: true,
          ...json(ref("UpdateTask"), { status: "in_progress" }),
        },
        responses: {
          200: { description: "The updated task", ...json(ref("Task"), exampleTask) },
          400: errorResponse("ValidationError"),
          404: errorResponse("NotFound"),
          409: errorResponse("Conflict"),
        },
      },
      delete: {
        tags: ["Tasks"],
        summary: "Delete a task",
        responses: {
          204: { description: "Deleted, no content" },
          404: errorResponse("NotFound"),
        },
      },
    },
  },
  components: {
    schemas: {
      // Request DTOs: the schemas that validate incoming requests.
      CreateTask: input(createTaskSchema),
      // .refine() isn't expressible in JSON Schema; minProperties documents it.
      UpdateTask: { ...input(updateTaskSchema), minProperties: 1 },
      // Response DTOs: the schemas in task.dto.ts.
      Task: output(taskResponseSchema),
      TaskList: {
        ...output(taskListResponseSchema),
        properties: {
          ...(output(taskListResponseSchema).properties as JsonSchema),
          data: { type: "array", items: ref("Task") },
        },
      },
      TaskStats: output(taskStatsResponseSchema),
      Error: {
        type: "object",
        required: ["error"],
        properties: {
          error: {
            type: "object",
            required: ["code", "message"],
            properties: {
              code: {
                type: "string",
                enum: ["VALIDATION_ERROR", "INVALID_JSON", "NOT_FOUND", "CONFLICT", "INTERNAL_ERROR"],
              },
              message: { type: "string" },
              details: {
                description: "Present for VALIDATION_ERROR: one entry per invalid field",
                type: "array",
                items: {
                  type: "object",
                  properties: { path: { type: "string" }, message: { type: "string" } },
                },
              },
            },
          },
        },
      },
    },
    responses: {
      ValidationError: {
        description: "Invalid body, query or JSON (VALIDATION_ERROR or INVALID_JSON)",
        ...json(
          ref("Error"),
          errorExample("VALIDATION_ERROR", "Invalid request", [
            { path: "title", message: "Too small: expected string to have >=1 characters" },
          ]),
        ),
      },
      NotFound: {
        description: "No task with this id",
        ...json(ref("Error"), errorExample("NOT_FOUND", "Task 3f1c2b7e-... not found")),
      },
      Conflict: {
        description: "Business rule broken",
        ...json(ref("Error"), errorExample("CONFLICT", "Cannot change status from done to todo")),
      },
    },
  },
};
