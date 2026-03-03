# FloorDoc API – V5 (Enhanced with SQLite & RBAC)

_A modular Node.js + TypeScript REST API for workspace intelligence, integrating event analytics, utilization scoring, and role-aware recommendations._

---

## 📚 Table of Contents
1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Configuration Modes](#configuration-modes)
4. [API Endpoints](#api-endpoints)
5. [Testing & Teardown](#testing--teardown)
6. [Deployment (Render)](#deployment-render)
7. [Changelog (V1 → V5 Enhancements)](#changelog-v1--v5-enhancements)
8. [Architecture Overview](#architecture-overview)
9. [Known Issues & TODOs](#known-issues--todos)
10. [License](#license)

---

## 🧭 Overview

The **FloorDoc API – V5** demonstrates a modular RESTful architecture combining multi-tenancy, RBAC-driven access, and flexible persistence layers (SQLite or in-memory).  
It supports:
- Dynamic event ingestion (`/events`, `/event`)
- Utilization and recommendation analytics (`/utilization`, `/recommend`)
- Natural language query interpretation via LLM stub (`/query`)
- Role- and region-based access filtering middleware

---

## ⚡ Quick Start

### 🧩 Prerequisites
- Node.js **v20+**
- npm **v9+**
- TypeScript **v5+**

### 🚀 Setup

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Start in default SQLite mode (on port 8080)
npm start
```

### 🧠 Alternate InMemory Mode

```bash
# Run using volatile in-memory datastore
STORE_MODE=memory npm start
```

**Default Port:** `8080`  
**Swagger UI:** [http://localhost:8080/api-docs](http://localhost:8080/api-docs)

---

## ⚙️ Configuration Modes

| Mode | Description | Environment Variable |
|------|--------------|----------------------|
| **SQLite (default)** | Persistent local database (auto-seeded) | *(none)* |
| **InMemory** | Volatile data layer for testing/demo | `STORE_MODE=memory` |

---

## 🔗 API Endpoints

### 1️⃣ Events
| Method | Endpoint | Description |
|---------|-----------|-------------|
| `POST` | `/events` | Add a new event record |
| `POST` | `/event` | Alias used in integration tests |
| `GET`  | `/events?tenant_id={id}` | Retrieve events by tenant |

### 2️⃣ Utilization
| Method | Endpoint | Description |
|---------|-----------|-------------|
| `GET` | `/utilization?tenant_id={id}&room_id={room}` | Get utilization stats for a room |

### 3️⃣ Recommendations
| Method | Endpoint | Description |
|---------|-----------|-------------|
| `GET` | `/recommend?tenant_id={id}&office_id={office}` | Retrieve underutilized room list |

### 4️⃣ Natural Language Query (NLQ)
| Method | Endpoint | Description |
|---------|-----------|-------------|
| `POST` | `/query` | Parse natural language questions into structured results |

Sample request:
```bash
curl -X POST http://localhost:8080/query   -H "Content-Type: application/json"   -d '{"q": "show utilization for blr_finops in bankcorp"}'
```

Sample response:
```json
{
  "query": "show utilization for blr_finops in bankcorp",
  "result": {
    "tenant_id": "bankcorp",
    "office_id": "blr_finops",
    "average_utilization": 72.4
  }
}
```

---

## 🧪 Testing & Teardown

The project includes Jest-based test suites covering routes, RBAC middleware, and NLQ logic.

### Run all tests
```bash
NODE_ENV=test npm test
```

### Behavior
- Automatically builds with SQLite store.
- Seeds sample data before test run (`tests/setup.ts`).
- Clears database after tests complete.
- Compatible with both `SQLite` and `InMemory` modes.

Logs include:
```
🌱 Seeding test data...
🧹 Clearing SQLite data store...
```

---

## ☁️ Deployment (Render)

1. Push your repository to GitHub.
2. Connect it to [Render.com](https://render.com/).
3. Add the following settings under **Environment Variables**:
   - `NODE_ENV=production`
   - *(Optional)* `STORE_MODE=memory`
4. Render automatically builds using:
   ```bash
   npm install
   npm run build
   npm start
   ```
5. After deployment:
   - API URL: `https://<your-app>.onrender.com`
   - Swagger: `https://<your-app>.onrender.com/api-docs`

---

## 🧾 Changelog (V1 → V5 Enhancements)

| Version | Feature | Description |
|----------|----------|-------------|
| **V1** | Base API | Express + TypeScript + InMemory data |
| **V2** | Swagger Docs | Added auto-generated OpenAPI via `swagger-ui-express` |
| **V3** | SQLite Layer | Introduced persistent store with seeding & teardown |
| **V4** | NLQ Endpoint | Added `/query` route with LLM stub for natural language parsing |
| **V5** | RBAC + Region Filters | Role/region-based access control middleware added |
| **V5+** | Test Reactivation & Render Packaging | Jest suite reactivated, Render deployment verified |

---

## 🧩 Architecture Overview

```
          ┌───────────────────────────────┐
          │      FloorDoc API             │
          ├───────────────────────────────┤
          │        Express + TypeScript   │
          │───────────────────────────────│
          │ Routes: /events /utilization  │
          │          /recommend /query     │
          │───────────────────────────────│
          │  Middleware: Context + RBAC   │
          │───────────────────────────────│
          │     Data Layer Factory         │
          │   ├── InMemoryStore            │
          │   └── SQLiteStore (default)    │
          │───────────────────────────────│
          │      Tests & Seed Scripts     │
          └───────────────────────────────┘
```

---

## ⚠️ Known Issues & TODOs

- [ ] Fix `api.test.ts` singular `/event` 404 failure.
- [ ] Investigate RBAC viewer rejection returning `201` instead of `403`.
- [ ] Confirm documentation on SQLite vs InMemory modes remains in sync with store factory behavior.
- [ ] Validate Swagger and Postman collections after next merge.

---

## 📜 License

MIT © 2025 FloorDoc
