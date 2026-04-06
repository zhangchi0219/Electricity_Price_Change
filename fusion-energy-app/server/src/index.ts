import express from 'express';
import { corsMiddleware } from './middleware/cors';
import { initDatabase } from './db/init';
import categoriesRouter from './routes/categories';
import industriesRouter from './routes/industries';
import fusionRouter from './routes/fusion';
import timelineRouter from './routes/timeline';
import costsRouter from './routes/costs';
import quizRouter from './routes/quiz';
import interactionsRouter from './routes/interactions';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(corsMiddleware);
app.use(express.json());

// Routes
app.use('/api/categories', categoriesRouter);
app.use('/api/industries', industriesRouter);
app.use('/api/fusion-approaches', fusionRouter);
app.use('/api/timeline', timelineRouter);
app.use('/api/costs', costsRouter);
app.use('/api/quiz', quizRouter);
app.use('/api/interactions', interactionsRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Global error handler — prevents unhandled route errors from crashing the process
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

// Initialize DB, then start server
initDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });

export default app;
