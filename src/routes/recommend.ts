import express from 'express';
import { recommendUnderutilizedRooms } from '../services/analytics.js';

const router = express.Router();

router.get('/recommend/:tenant_id/:office_id', (req, res) => {
  const { tenant_id, office_id } = req.params;
  const threshold = parseFloat(String(process.env.RECOMMEND_THRESHOLD ?? '0.3'));
  const recs = recommendUnderutilizedRooms(tenant_id, office_id, threshold);
  return res.json({ tenant_id, office_id, threshold, recommendations: recs });
});

export default router;
