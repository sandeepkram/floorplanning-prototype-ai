# Saltmine Prototype API (Task 3)

Simplified multi-tenant API demonstrating occupancy event ingestion, 7‑day utilization,
and heuristic recommendations. **Demo-only** with clear _PRODUCTION UPGRADE STUBS_ in code.

## Quick Start

```bash
npm install
npm run build
npm start
# Server on http://localhost:8080
# Swagger on http://localhost:8080/api-docs
```

### Dev Mode
```bash
npm run dev
```

## Env
Copy `.env.example` to `.env` if needed. Defaults:
- `PORT=8080`
- `RECOMMEND_THRESHOLD=0.3`

## API Examples (curl)

```bash
curl -X POST http://localhost:8080/event -H "Content-Type: application/json" -d '{
  "tenant_id":"bank123","room_id":"confA",
  "timestamp":"2025-10-01T10:00:00Z","people_count":5,"office_id":"blr-hq"
}'

curl http://localhost:8080/utilization/bank123/confA
curl http://localhost:8080/recommend/bank123/blr-hq
```

## Architecture & Upgrade Stubs

- **Multi-tenancy / Persistence**: In-memory `Map<tenant, Map<room, events[]>>` in `dataStore.ts`  
  _Replace with PostgreSQL/Redis + DAO/ORM, per-tenant encryption, and Redis cache._
- **Scalability**: Stateless service; containerize with provided `Dockerfile`.  
  _Horizontal scale under K8s; externalize cache/session to Redis._
- **Security/Compliance**: Basic input validation only.  
  _Add OIDC/JWT auth, RBAC, audit logs, PII controls, data retention policies._
- **Extensibility (AI)**: Heuristic recommendations.  
  _Replace with ML service (forecasting), add XAI and human-in-loop._
- **Observability**: `morgan` request logs.  
  _Replace with Winston structured logs, OpenTelemetry traces/metrics, Prometheus exporter._

## Swagger / Postman
- Swagger UI: `http://localhost:8080/api-docs`
- Postman: import `Saltmine_Prototype.postman_collection.json`

## Tests
```bash
npm test
```

## GitHub Actions
CI workflow at `.github/workflows/build.yml` (install → test → build → docker build).

## License
MIT (or choose as needed)

---

## Multi-Tenancy (V1 Additive Samples)

Tenants (header `x-tenant-id` or path `/api/{tenantId}`): bankcorp, retailx, healthplus

Entities: users, accounts (bankcorp), products (retailx), patients (healthplus)

Run:
```
npm install
npm run dev
# Swagger: http://localhost:8080/api-docs
```

Examples per endpoint are provided in swagger/swagger.json and postman/saltmine-api.postman_collection.json.
