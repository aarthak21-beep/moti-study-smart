import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { authMiddleware } from './server/auth.js';
import { authRouter } from './server/routes/authRoutes.js';
import { courseRouter } from './server/routes/courseRoutes.js';
import { quizRouter } from './server/routes/quizRoutes.js';
import { subscriptionRouter } from './server/routes/subscriptionRoutes.js';
import { bookmarkRouter } from './server/routes/bookmarkRoutes.js';
import { adminRouter } from './server/routes/adminRoutes.js';

async function startServer() {
  const app = express();

  // Basic Middlewares
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Global Auth extraction
  app.use(authMiddleware);

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', app: 'Moti Study Smart API', timestamp: new Date().toISOString() });
  });

  // Mount API modules
  app.use('/api/auth', authRouter);
  app.use('/api/courses', courseRouter);
  app.use('/api/quizzes', quizRouter);
  app.use('/api/subscription', subscriptionRouter);
  app.use('/api/bookmarks', bookmarkRouter);
  app.use('/api/admin', adminRouter);

  // Vite middleware in development vs Static files in production
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, port: 3000 },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  const PORT = Number(process.env.PORT) || 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Moti Study Smart server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
