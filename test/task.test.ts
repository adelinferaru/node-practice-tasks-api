// Vitest exposes describe/it/expect much like PHPUnit's TestCase methods;
// supertest fires real HTTP requests at the app IN-PROCESS — no port, no server.
import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { createApp } from "../src/app";

// This works precisely because app.ts builds the app without listen()ing —
// the app/server split exists FOR this line.
// A fresh app per test = a fresh in-memory store, so tests never depend on each other.
let app: ReturnType<typeof createApp>;

describe("Tasks API", () => {
  beforeEach(() => {
    app = createApp();
  });

  // Happy path: create then fetch. Also proves the 'todo' default applied.
  it("creates and fetches a task", async () => {
    const created = await request(app)
      .post("/api/tasks")
      .send({ title: "Prepare interview", priority: "high" });
    expect(created.status).toBe(201);
    expect(created.body.status).toBe("todo"); // default from createTaskSchema

    const fetched = await request(app).get(`/api/tasks/${created.body.id}`);
    expect(fetched.status).toBe(200);
    expect(fetched.body.title).toBe("Prepare interview");
  });

  // Validation path: empty title + invalid enum → 400 with field-level details
  // (shape produced by the ZodError branch of the central errorHandler).
  it("returns 400 for invalid input", async () => {
    const res = await request(app)
      .post("/api/tasks")
      .send({ title: "", priority: "urgent" });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(res.body.error.details.length).toBeGreaterThan(0);
  });

  // Unknown id → NotFoundError thrown in the service → 404 from errorHandler.
  it("returns 404 for an unknown task", async () => {
    const res = await request(app).get("/api/tasks/does-not-exist");
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });

  // The business rule: done → todo is blocked with 409 Conflict.
  it("blocks done -> todo", async () => {
    const { body } = await request(app)
      .post("/api/tasks")
      .send({ title: "x", status: "done" });
    const res = await request(app)
      .patch(`/api/tasks/${body.id}`)
      .send({ status: "todo" });
    expect(res.status).toBe(409);
  });

  // PATCH with an empty body is rejected by the .refine() in updateTaskSchema.
  it("rejects an empty PATCH body", async () => {
    const { body } = await request(app).post("/api/tasks").send({ title: "y" });
    const res = await request(app).patch(`/api/tasks/${body.id}`).send({});
    expect(res.status).toBe(400);
  });

  // Pagination meta: create exactly 3 tasks; limit=2 must slice and report totals.
  it("paginates and reports meta", async () => {
    for (const title of ["a", "b", "c"]) {
      await request(app).post("/api/tasks").send({ title });
    }
    const res = await request(app).get("/api/tasks?limit=2&page=1");
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.meta).toEqual({ page: 1, limit: 2, total: 3, totalPages: 2 });
  });

  // Every error response uses the same { error: { code, message } } shape.
  it("uses one error format everywhere", async () => {
    const responses = await Promise.all([
      request(app).get("/api/tasks/does-not-exist"), // NotFoundError
      request(app).get("/api/nope"), // unknown route
      request(app).post("/api/tasks").send({}), // ZodError
    ]);
    for (const res of responses) {
      expect(res.body).toEqual({
        error: expect.objectContaining({
          code: expect.any(String),
          message: expect.any(String),
        }),
      });
    }
  });

  // express.json() parse failures must be a 400, not a 500.
  it("returns 400 for malformed JSON", async () => {
    const res = await request(app)
      .post("/api/tasks")
      .set("Content-Type", "application/json")
      .send("{bad json");
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("INVALID_JSON");
  });

  // dueDate must be an ISO string; null and numbers used to be coerced to 1970.
  it("accepts ISO dueDates and rejects anything else", async () => {
    const ok = await request(app)
      .post("/api/tasks")
      .send({ title: "d", dueDate: "2026-12-01" });
    expect(ok.status).toBe(201);
    expect(ok.body.dueDate).toBe("2026-12-01T00:00:00.000Z");

    for (const dueDate of [null, 12345, "tomorrow"]) {
      const bad = await request(app)
        .post("/api/tasks")
        .send({ title: "d", dueDate });
      expect(bad.status).toBe(400);
    }
  });
});
