import request from 'supertest';
import { spawn } from 'child_process';
import path from 'path';
import http from 'http';
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import YAML from 'yamljs';
import swaggerUi from 'swagger-ui-express';

import eventsRoute from '../src/routes/events.js';
import utilizationRoute from '../src/routes/utilization.js';
import recommendRoute from '../src/routes/recommend.js';

// Minimal app for tests (avoid port conflicts)
const app = express();
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());
const swaggerDocument = YAML.parse('openapi: 3.0.0'); // dummy
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/', eventsRoute);
app.use('/', utilizationRoute);
app.use('/', recommendRoute);

describe('API', () => {
  it('should accept an event and compute utilization', async () => {
    await request(app).post('/test-event').send({
      tenant_id: 'bank123',
      room_id: 'confA',
      timestamp: new Date().toISOString(),
      people_count: 3,
      office_id: 'blr-hq'
    }).expect(201);

    const res = await request(app).get('/utilization/bank123/confA').expect(200);
    expect(res.body.tenant_id).toBe('bank123');
    expect(res.body.room_id).toBe('confA');
    expect(res.body.samples).toBeGreaterThanOrEqual(1);
  });

  it('should recommend underutilized rooms (heuristic)', async () => {
    // add a low-utilization event
    await request(app).post('/test-event').send({
      tenant_id: 'bank123',
      room_id: 'confB',
      timestamp: new Date().toISOString(),
      people_count: 1,
      office_id: 'blr-hq'
    }).expect(201);

    const res = await request(app).get('/recommend/bank123/blr-hq').expect(200);
    expect(res.body.underutilized_rooms).toBeDefined();
    expect(Array.isArray(res.body.underutilized_rooms)).toBe(true);
  });
});
