import { Router } from 'express';
import { db } from '../db/index';
import { user_interactions } from '../db/schema';

const router = Router();

// POST /api/interactions
router.post('/', async (req, res) => {
  const { session_id, interaction_type, target_type, target_id, value } = req.body as {
    session_id: string;
    interaction_type: 'vote' | 'quiz_answer' | 'bookmark';
    target_type?: string;
    target_id?: number;
    value?: string;
  };

  if (!session_id || !interaction_type) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  await db.insert(user_interactions).values({
    session_id,
    interaction_type,
    target_type,
    target_id,
    value,
  });

  res.json({ success: true });
});

export default router;
