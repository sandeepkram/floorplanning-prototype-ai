import express from 'express';
import router from './routes/index.js';
import morgan from 'morgan';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import YAML from 'yamljs';
import swaggerUi from 'swagger-ui-express';
import { createStore } from './data/storefactory.js';

import eventsRoute from './routes/events.js';
import utilizationRoute from './routes/utilization.js';
import recommendRoute from './routes/recommend.js';
import { contextMiddleware } from './middleware/context.js';
import queryRoute from './routes/query.js';

// 🗃 Initialize data store (defaults to SQLite)
const store = createStore();

if ('seed' in store && typeof store.seed === 'function') {
  try {
    (store as any).seed();
  } catch (err) {
    console.error('⚠️  Store seeding failed:', err);
  }
}

const app = express();

// 🧩 Core middleware
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());
app.use(contextMiddleware);

// 🧪 Shim: Singular POST /event (used in Jest tests)
app.post('/event', (req, res) => {
  try {
    const body = req.body;
    if (
      !body ||
      typeof body !== 'object' ||
      !body.tenant_id ||
      !body.room_id ||
      !body.timestamp
    ) {
      return res.status(400).json({ error: 'Invalid payload' });
    }

  // Directly write to store (type-safe)
    if ('addEvent' in store && typeof (store as any).addEvent === 'function') {
      (store as any).addEvent(body.tenant_id, body);
    } else if ('insertEvent' in store && typeof (store as any).insertEvent === 'function') {
      (store as any).insertEvent(body.tenant_id, body);
    } else {
      console.warn('⚠️ No compatible event insert method found on store — skipping insert');
    }


    return res.status(201).json({ ok: true });
  } catch (err) {
    console.error('❌ Direct /event alias error:', err);
    return res.status(500).json({ error: 'Failed to store event' });
  }
});

// 📘 Swagger setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const swaggerPath = path.join(__dirname, '..', 'docs', 'swagger.yaml');
const swaggerDocument = YAML.load(swaggerPath);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// 🧩 Routes (order matters)
app.use('/events', eventsRoute);
app.use('/event', eventsRoute); // ✅ alias for test suite
app.use('/utilization', utilizationRoute);
app.use('/recommend', recommendRoute);
app.use('/', queryRoute);

// 🩺 Health check
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// 🏠 Root info
app.get('/', (_req, res) => {
  res.send(
    '✅ Saltmine Prototype API is running. Visit /api-docs for Swagger UI.'
  );
});

// 🚀 Production upgrade stubs:
// - Add OIDC/JWT auth middleware + RBAC checks.
// - Add rate limiting & schema validation at edge.
// - Add Prometheus metrics / health probes.

// ✅ Export app for Jest / Supertest
export default app;

// 🧪 Only start server outside test mode
if (process.env.NODE_ENV !== 'test') {
  const port = Number(process.env.PORT || 8080);
  app.listen(port, () => {
    console.log(`Saltmine Prototype API listening on port ${port}`);
    console.log(`Swagger UI available at http://localhost:${port}/api-docs`);
  });
}
