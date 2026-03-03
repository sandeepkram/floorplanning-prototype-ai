import express from 'express';

const router = express.Router();

// Base informational route (Render safe)
router.get('/', (req, res) => {
  res.json({
    message: 'FloorDoc API is running.',
    hint: 'Include header x-tenant-id for tenant-scoped endpoints.'
  });
});

// Health check route
router.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

export default router;
