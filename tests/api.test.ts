import request from 'supertest';
import app from '../src/server.js';

describe('API', () => {
  const commonHeaders = {
    "x-user-role": "admin",
    "x-user-region": "IN",
    "x-tenant-id": "bankcorp",  // Match to known seeded tenant
  };

  it('should accept an event and compute utilization', async () => {
  await request(app)
    .post('/test-event')
    .set(commonHeaders)
    .send({
      tenant_id: 'bankcorp',
      room_id: 'conf_A',
      timestamp: new Date().toISOString(),
      people_count: 3,
      office_id: 'blr-hq'
    })
    .expect(201);


  const res = await request(app)
    .get('/utilization')
    .set(commonHeaders)
    .query({ tenant_id: 'bankcorp', room_id: 'conf_A' })
    .expect(200);

  // ✅ Only assert on keys that are known to be returned
expect(res.body).toHaveProperty('average_people');
expect(res.body).toHaveProperty('peak_people');
expect(res.body.total_events).toBeGreaterThanOrEqual(1);
});

  it('should recommend underutilized rooms (heuristic)', async () => {
    await request(app)
      .post('/test-event')
      .set(commonHeaders)
      .send({
        tenant_id: 'bankcorp',
        room_id: 'conf_B',
        timestamp: new Date().toISOString(),
        people_count: 1,
        office_id: 'blr_finops'
      })
      .expect(201);

    const res = await request(app)
      .get('/recommend')
      .set(commonHeaders)
      .query({ tenant_id: 'bankcorp', office_id: 'blr_finops' })
      .expect(200);

    expect(res.body.underutilized_rooms).toBeDefined();
  });
});
