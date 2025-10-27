import express from 'express';
import { eventSchema } from '../utils/validation.js';
import { addEvent } from '../services/dataStore.js';
import { store } from '../data/storefactory.js';

const router = express.Router();

/**
 * POST /event or /events
 * Accepts an event payload and stores it.
 */
router.post('/', (req, res) => {
  try {
    const parsed = eventSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'Invalid payload',
        details: parsed.error.errors,
      });
    }

    addEvent(parsed.data);
    return res.status(201).json({ ok: true });
  } catch (err) {
    console.error('❌ Events API POST error:', err);
    return res.status(500).json({ error: 'Failed to store event' });
  }
});

// ✅ Mirror route for exact /event (no trailing slash)
router.post('', (req, res) => {
  try {
    const parsed = eventSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'Invalid payload',
        details: parsed.error.errors,
      });
    }

    addEvent(parsed.data);
    return res.status(201).json({ ok: true });
  } catch (err) {
    console.error('❌ Events API POST (alias) error:', err);
    return res.status(500).json({ error: 'Failed to store event' });
  }
});

/**
 * GET /events?tenant_id=bankcorp
 * Returns all events for a given tenant.
 */
router.get('/', (req, res) => {
  try {
    const tenant_id = req.query.tenant_id as string;
    if (!tenant_id) {
      return res
        .status(400)
        .json({ error: 'Missing tenant_id in query' });
    }

    const offices: string[] = store.getOfficeRooms(tenant_id, '') || [];
    const result = offices.map((room: string) =>
      store.getRoomEvents(tenant_id, room)
    );

    res.json(result.flat());
  } catch (err) {
    console.error('❌ Events API GET error:', err);
    res.status(500).json({ error: 'Failed to retrieve events' });
  }
});

export default router;
