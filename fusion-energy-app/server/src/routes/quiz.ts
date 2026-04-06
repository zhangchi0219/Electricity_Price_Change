import { Router } from 'express';
import { db } from '../db/index';
import { quiz_questions, user_interactions } from '../db/schema';
import { eq } from 'drizzle-orm';

const router = Router();

// GET /api/quiz?section=fusion_basics
router.get('/', async (req, res) => {
  try {
    const { section } = req.query;
    const data =
      section && typeof section === 'string'
        ? await db.select().from(quiz_questions).where(eq(quiz_questions.section, section))
        : await db.select().from(quiz_questions).orderBy(quiz_questions.sort_order);

    const parsed = data.map((q) => ({ ...q, options: JSON.parse(q.options) }));
    res.json(parsed);
  } catch (err) {
    console.error('Error fetching quiz:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/quiz/answer
router.post('/answer', async (req, res) => {
  try {
    const { question_id, selected_label, session_id } = req.body as {
      question_id: number;
      selected_label: string;
      session_id: string;
    };

    if (!question_id || !selected_label || !session_id) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const rows = await db.select().from(quiz_questions).where(eq(quiz_questions.id, question_id));
    if (!rows.length) {
      res.status(404).json({ error: 'Question not found' });
      return;
    }
    const question = rows[0];

    const options = JSON.parse(question.options) as Array<{
      label: string;
      text_zh: string;
      text_en: string;
      correct: boolean;
    }>;
    const selected = options.find((o) => o.label === selected_label);
    const correct = selected?.correct ?? false;

    await db.insert(user_interactions).values({
      session_id,
      interaction_type: 'quiz_answer',
      target_type: 'quiz_question',
      target_id: question_id,
      value: JSON.stringify({ selected_label, correct }),
    });

    res.json({
      correct,
      explanation_zh: question.explanation_zh,
      explanation_en: question.explanation_en,
    });
  } catch (err) {
    console.error('Error answering quiz:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
