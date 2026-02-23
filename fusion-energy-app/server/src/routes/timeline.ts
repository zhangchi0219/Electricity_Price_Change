import { Router } from 'express';
import { db } from '../db/index';
import { timeline_events } from '../db/schema';
import { eq, asc } from 'drizzle-orm';

const router = Router();

// GET /api/timeline?type=projected
router.get('/', async (req, res) => {
  const { type } = req.query;

  if (type && typeof type === 'string') {
    const data = await db
      .select()
      .from(timeline_events)
      .where(eq(timeline_events.event_type, type as 'past' | 'current' | 'projected'))
      .orderBy(asc(timeline_events.year));
    res.json(data);
    return;
  }

  const data = await db.select().from(timeline_events).orderBy(asc(timeline_events.year));
  res.json(data);
});

export default router;
