# 📚 node-practice-tasks-api

> **🎓 Learning project, not production code.**
> I built this small REST API as a practice test while learning Node.js, Express 5 and TypeScript.
> Expect simplifications, such as an in-memory store that resets on every restart.

## 📝 The assignment

> Build a REST API in **Node.js, Express and TypeScript** to manage tasks.
> Use **in-memory storage**; no database needed.

### Task model

| Field | Type | Rules |
| --- | --- | --- |
| `id` | UUID | generated |
| `title` | string | **required**, 1–200 chars |
| `description` | string | optional, max 2000 chars |
| `status` | `todo` \| `in_progress` \| `done` | default `todo` |
| `priority` | `low` \| `medium` \| `high` | default `medium` |
| `dueDate` | ISO date | optional |
| `createdAt` | date | set on create |
| `updatedAt` | date | set on every change |

### Endpoints

| Method | Path | Description |
| --- | --- | --- |
| `POST` | `/api/tasks` | Create a task |
| `GET` | `/api/tasks` | List tasks (see query options below) |
| `GET` | `/api/tasks/:id` | Get one task |
| `PATCH` | `/api/tasks/:id` | Partial update |
| `DELETE` | `/api/tasks/:id` | Delete a task |

**List query options for `GET /api/tasks`**

| Param | Values | Default |
| --- | --- | --- |
| `status` | `todo` \| `in_progress` \| `done` | none |
| `priority` | `low` \| `medium` \| `high` | none |
| `sort` | `createdAt` \| `-createdAt` \| `dueDate` | `-createdAt` (newest first) |
| `page` | integer ≥ 1 | `1` |
| `limit` | integer 1–100 | `10` |

### Requirements

- Input validation with meaningful **400** errors
- **404** for unknown tasks
- A consistent error format
- Proper HTTP status codes

### Bonus

- [x] Business rule: a task that is `done` cannot go back to `todo`
- [x] `GET /api/tasks/stats`, returning task counts per status
- [x] Tests (Vitest + Supertest, in `test/`)

### Error format

Every error response, whatever the cause, has the same shape:

```json
{ "error": { "code": "VALIDATION_ERROR", "message": "Invalid request", "details": [{ "path": "title", "message": "..." }] } }
```

| Status | `code` | When |
| --- | --- | --- |
| 400 | `VALIDATION_ERROR` | Body or query fails validation (`details` lists each field) |
| 400 | `INVALID_JSON` | Request body is not valid JSON |
| 404 | `NOT_FOUND` | Unknown task id or unknown route |
| 409 | `CONFLICT` | Business rule broken (`done` → `todo`) |
| 500 | `INTERNAL_ERROR` | Anything unexpected (details are logged, never sent) |

## What I practiced
- Layered structure: routes → controller → service → repository
- Request validation with **Zod** (body and query middlewares)
- Centralized error handling and a typed config loaded from `.env`
- Testing with **Vitest** + **Supertest**: in-process HTTP tests, a fresh app per test

## Stack
Node.js · Express 5 · TypeScript · Zod · Vitest · Supertest · tsx

## Run it
```bash
npm install
cp .env.example .env   # NODE_ENV and PORT are optional (defaults: development, 3000)
npm run dev
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Start with reload on save (tsx watch) |
| `npm run build` / `npm start` | Compile to `dist/` and run it |
| `npm test` | Run the tests |
| `npm run typecheck` | Type-check without emitting |

There's also a `GET /health` endpoint that reports server status and uptime.
