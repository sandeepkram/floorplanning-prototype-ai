import express from 'express';
import { utilizationLastNDays } from '../services/analytics.js';

const router = express.Router();

router.get('/utilization/:tenant_id/:room_id', (req, res) => {
  const { tenant_id, room_id } = req.params;
  const result = utilizationLastNDays(tenant_id, room_id, 7);
  return res.json(result);
});

export default router;
