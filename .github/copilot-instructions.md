# FloorDoc API – Agent Guide

## Architecture Overview

**FloorDoc** is a multi-tenant, role-based REST API for workspace intelligence built on Express + TypeScript. The core mission: ingest occupancy events, compute utilization scores, and recommend underutilized spaces.

```
Express Server (src/server.ts)
  ├─ Middleware Stack:
  │  ├─ contextMiddleware: Extract tenant/user context from headers
  │  ├─ accessControlMiddleware: Enforce RBAC + tenant isolation
  │  └─ requireTenantHeader: Block requests missing x-tenant-id
  ├─ Routes (src/routes/):
  │  ├─ /events: Ingest occupancy events
  │  ├─ /utilization: Compute room utilization over time windows
  │  ├─ /recommend: Find underutilized rooms in an office
  │  └─ /query: Parse natural language to structured queries
  └─ Data Layer (storefactory):
     ├─ SqliteStore (default): Persistent events table
     └─ InMemoryStore: Volatile for testing/demo
```

## Critical Patterns

### 1. Tenant Isolation & Headers
**Every API request must include `x-tenant-id`.** This is enforced in [middleware/requiretenant.ts](src/middleware/requiretenant.ts) and cascades to all data access.

- Request headers also carry: `x-user-id`, `x-user-role` (Admin|Analyst|Viewer), `x-user-region`
- Role context attached to `req.userCtx` by [middleware/context.ts](src/middleware/context.ts)
- Example: `curl -H "x-tenant-id: bankcorp" -H "x-user-role: Admin" http://localhost:8080/events`

### 2. Role-Based Access Control (RBAC)
[src/middleware/accesscontrol.ts](src/middleware/accesscontrol.ts) enforces method permissions per role:

```typescript
admin:   ["GET", "POST", "PUT", "DELETE"]
analyst: ["GET", "POST"]
viewer:  ["GET"] in prod/test, ["GET","POST"] in local dev
```

**Critical:** In `NODE_ENV=test|production`, Viewer role is **read-only**. Local dev allows POST for Swagger demo.

### 3. Data Store Factory Pattern
[src/data/storefactory.ts](src/data/storefactory.ts) creates instances via `STORE_MODE` env var:

```typescript
export function createStore(mode: StoreMode = "sqlite") {
  if (mode === "memory") return new InMemoryStore();
  return new SqliteStore();  // Default
}
```

Use `STORE_MODE=memory npm start` for in-memory testing; default SQLite persists to `./data/floordoc.db`.

Both stores implement compatible methods: `seed()`, `clear()/reset()`, `getRoomEvents()`, `getOfficeRooms()`.

### 4. Event & Utilization Model
[src/models/types.ts](src/models/types.ts) defines core domain:

```typescript
interface OccupancyEvent {
  tenant_id: string;
  room_id: string;
  office_id?: string;
  timestamp: string;  // ISO format
  people_count?: number;
  present?: boolean;
}
```

Events are keyed by `(tenant_id, room_id)`. Utilization computed from `people_count` over sliding windows; see [src/services/analytics.ts](src/services/analytics.ts).

### 5. Route Registration Pattern
Routes are mounted in [src/server.ts](src/server.ts) lines 89–94. Use Express `.get()` / `.post()` with query params or path params:

```typescript
// Query params: /recommend?tenant_id=bankcorp&office_id=blr_finops
// OR path params: /recommend/:tenant_id/:office_id
```

**Swagger Compatibility:** All major endpoints have singular aliases (`/event` → `/events`) via regex rewrite.

### 6. Testing & Seeding
[tests/setup.ts](tests/setup.ts) runs before all tests:
- `beforeAll`: calls `store.seed()` (auto-loads [src/data/tenantData.ts](src/data/tenantData.ts))
- `afterAll`: calls `store.clear()` or `store.reset()`

Run tests with: `NODE_ENV=test npm test`  
**Do not run tests in production mode.**

## Developer Workflow

| Task | Command |
|------|---------|
| **Local dev** | `npm run dev` (ts-node-dev, auto-recompile) |
| **Build** | `npm run build` (outputs to `dist/`) |
| **Production start** | `npm start` (node dist/server.js) |
| **All tests** | `NODE_ENV=test npm test` (jest --runInBand) |
| **Swagger docs** | [http://localhost:8080/api-docs](http://localhost:8080/api-docs) after `npm run dev` |

When modifying middleware or services, restart the dev server. Jest is configured for ESM (importable `.js` extensions in src/).

## Adding a New Feature

**Example: Adding a new metric endpoint**

1. Create route file: `src/routes/newfeature.ts`
   ```typescript
   import express from 'express';
   import { computeFeature } from '../services/newfeature.js';
   
   const router = express.Router();
   router.get('/', (req, res) => {
     const result = computeFeature(req.userCtx);
     res.json(result);
   });
   
   export default router;
   ```

2. Register in [src/server.ts](src/server.ts) after access control middleware:
   ```typescript
   app.use('/newfeature', newfeatureRoute);
   ```

3. Create service in `src/services/newfeature.ts` that respects `req.userCtx.tenantId` for isolation.

4. Add test in `tests/newfeature.spec.ts` with `NODE_ENV=test` and sample data.

5. Update `docs/swagger.yaml` with endpoint specification.

## Debugging Checklist

- **404 errors**: Check route regex aliases in [src/server.ts](src/server.ts); ensure middleware order (tenant header → context → RBAC).
- **403 Forbidden**: Verify `x-user-role` header; check `accessControlMiddleware` logic for method permission.
- **Missing tenant_id header**: Caught by `requireTenantHeader` middleware; returns 400.
- **SQLite not persisting**: Check `STORE_MODE` (default is sqlite). Ensure `./data/` dir writable. View schema: `sqlite3 ./data/floordoc.db ".schema"`
- **Tests fail**: Run `NODE_ENV=test npm test`. If teardown fails, check `store.clear()` method exists; verify test DB isolation.

## Deployment (Render)

Push to GitHub `main` or `feature/**` branch:
1. GitHub Actions runs [.github/workflows/build.yml](.github/workflows/build.yml): `npm install` → `npm test` → `npm run build`
2. Render auto-deploys on success
3. Swagger API docs at `https://<app>.onrender.com/api-docs`
4. CORS allowlist in [src/server.ts](src/server.ts) includes Render + Codespaces domains.

Set `NODE_ENV=production` (Render env var) to enable strict viewer-only RBAC.

## Key Files by Responsibility

| File | Purpose |
|------|---------|
| `src/server.ts` | Express app, middleware chain, route registration |
| `src/middleware/context.ts` | Extract user context from headers |
| `src/middleware/accesscontrol.ts` | RBAC enforcer |
| `src/data/storefactory.ts` | Pluggable store initialization |
| `src/data/sqliteStore.ts` | SQLite implementation (better-sqlite3) |
| `src/data/v5Store.ts` | In-memory fallback store |
| `src/routes/` | Endpoint handlers (events, utilization, recommend, query) |
| `src/services/` | Business logic & analytics |
| `tests/setup.ts` | Test fixtures & teardown |
| `docs/swagger.yaml` | OpenAPI spec |
