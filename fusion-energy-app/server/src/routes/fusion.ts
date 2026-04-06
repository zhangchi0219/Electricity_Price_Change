import { Router } from 'express';
import { db } from '../db/index';
import { fusion_approaches } from '../db/schema';

const router = Router();

// GET /api/fusion-approaches
router.get('/', async (_req, res) => {
  try {
    const data = await db.select().from(fusion_approaches);
    res.json(data);
  } catch (err) {
    console.error('Error fetching fusion approaches:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
