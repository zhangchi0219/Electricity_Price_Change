import { Router } from 'express';
import { db } from '../db/index';
import { cost_data } from '../db/schema';
import { eq, gte, and } from 'drizzle-orm';

const router = Router();

// GET /api/costs?source=fusion&year_min=2030
router.get('/', async (req, res) => {
  const { source, year_min } = req.query;

  const conditions = [];
  if (source && typeof source === 'string') {
    conditions.push(eq(cost_data.energy_source, source));
  }
  if (year_min) {
    const yr = parseInt(year_min as string, 10);
    if (!isNaN(yr)) conditions.push(gte(cost_data.year, yr));
  }

  const data =
    conditions.length > 0
      ? await db.select().from(cost_data).where(and(...conditions))
      : await db.select().from(cost_data);

  res.json(data);
});

export default router;
