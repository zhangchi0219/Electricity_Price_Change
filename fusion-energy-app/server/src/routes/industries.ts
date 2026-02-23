import { Router } from 'express';
import { db } from '../db/index';
import { industries } from '../db/schema';
import { eq } from 'drizzle-orm';

const router = Router();

// GET /api/industries
router.get('/', async (_req, res) => {
  const data = await db.select().from(industries).orderBy(industries.sort_order);
  res.json(data);
});

// GET /api/industries/:id
router.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: 'Invalid id' });
    return;
  }
  const data = await db.select().from(industries).where(eq(industries.id, id));
  if (!data.length) {
    res.status(404).json({ error: 'Industry not found' });
    return;
  }
  res.json(data[0]);
});

export default router;
