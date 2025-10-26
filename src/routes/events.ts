import express from 'express';
import { eventSchema } from '../utils/validation.js';
import { addEvent } from '../services/dataStore.js';
import { store } from "../data/storefactory";

const router = express.Router();

router.post('/event', (req, res) => {
  const parsed = eventSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid payload', details: parsed.error.errors });
  }
  addEvent(parsed.data);
  return res.status(201).json({ ok: true });
});

export default router;
