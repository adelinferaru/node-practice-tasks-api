# 📚 node-practice-tasks-api

> **🎓 Learning project, not production code.**
> I built this small REST API while learning Node.js, Express 5 and TypeScript.
> Expect simplifications, such as an in-memory store that resets on every restart.

## What I practiced
- Layered structure: routes → controller → service → repository
- Request validation with **Zod** (body and query middlewares)
- Centralized error handling and a typed config loaded from `.env`
- Testing with **Vitest** + **Supertest**

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

## Endpoints
| Method | Path |
| --- | --- |
| GET | `/health` |
| GET | `/api/tasks` |
| GET | `/api/tasks/stats` |
| POST | `/api/tasks/:id` |
| GET / PATCH / DELETE | `/api/tasks/:id` |
