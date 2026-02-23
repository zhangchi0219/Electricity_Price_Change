import { Router } from 'express';
import { db } from '../db/index';
import { fusion_approaches } from '../db/schema';

const router = Router();

// GET /api/fusion-approaches
router.get('/', async (_req, res) => {
  const data = await db.select().from(fusion_approaches);
  res.json(data);
});

export default router;
