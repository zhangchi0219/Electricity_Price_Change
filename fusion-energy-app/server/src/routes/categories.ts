import { Router } from 'express';
import { db } from '../db/index';
import { categories, industries } from '../db/schema';
import { eq } from 'drizzle-orm';

const router = Router();

// GET /api/categories
router.get('/', async (_req, res) => {
  const data = await db.select().from(categories).orderBy(categories.sort_order);
  res.json(data);
});

// GET /api/categories/:slug/industries
router.get('/:slug/industries', async (req, res) => {
  const cat = await db.select().from(categories).where(eq(categories.slug, req.params.slug));
  if (!cat.length) {
    res.status(404).json({ error: 'Category not found' });
    return;
  }
  const data = await db
    .select()
    .from(industries)
    .where(eq(industries.category_id, cat[0].id!))
    .orderBy(industries.sort_order);
  res.json(data);
});

export default router;
