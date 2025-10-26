import express from 'express';
import router from './routes/index';
import morgan from 'morgan';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import YAML from 'yamljs';
import swaggerUi from 'swagger-ui-express';

import eventsRoute from './routes/events.js';
import utilizationRoute from './routes/utilization.js';
import recommendRoute from './routes/recommend.js';

const app = express();

// Basic request logging for demo; replace with structured logging (Winston/ELK) in production.
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

// Swagger docs
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const swaggerPath = path.join(__dirname, '..', 'docs', 'swagger.yaml');
const swaggerDocument = YAML.load(swaggerPath);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
app.use('/', eventsRoute);
app.use('/', utilizationRoute);
app.use('/', recommendRoute);

// Health endpoint
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// Root route
app.get('/', (_req, res) => {
  res.send('✅ Saltmine Prototype API is running. Visit /api-docs for Swagger UI.');
});


// PRODUCTION UPGRADE STUBS:
// - Add OIDC/JWT auth middleware + RBAC checks.
// - Add rate-limiting and request validation at the edge (API Gateway).
// - Add metrics endpoint / Prometheus exporter.

const port = Number(process.env.PORT || 8080);
app.listen(port, () => {
  console.log(`Saltmine Prototype API listening on port ${port}`);
  console.log(`Swagger UI available at http://localhost:${port}/api-docs`);
});
