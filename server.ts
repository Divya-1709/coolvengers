import express from 'express';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { Database } from './server/db.js';
import { authRouter } from './server/routes/auth.js';
import { leadsRouter } from './server/routes/leads.js';
import { payoutsRouter } from './server/routes/payouts.js';
import { notificationsRouter } from './server/routes/notifications.js';
import { auditRouter } from './server/routes/audit.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const isProduction = process.env.NODE_ENV === 'production';

  // Enable CORS for Vercel and local development
  app.use(
    cors({
      origin: true,
      credentials: true,
    })
  );

  app.use(express.json());

  // Initialize DB
  await Database.init();

  // Root welcome / health info for Render backend
  app.get('/', (_req, res, next) => {
    const distPath = path.resolve(__dirname, 'dist');
    if (isProduction && !fs.existsSync(distPath)) {
      return res.json({
        name: 'Coolvengers Ambassador Club API',
        status: 'online',
        health: '/api/health',
      });
    }
    next();
  });

  // Mount API routes
  app.use('/api/auth', authRouter);
  app.use('/api/leads', leadsRouter);
  app.use('/api/payouts', payoutsRouter);
  app.use('/api/notifications', notificationsRouter);
  app.use('/api/audit', auditRouter);

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  const distPath = path.resolve(__dirname, 'dist');
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  } else {
    app.use('*', (_req, res) => {
      res.status(404).json({
        error: 'Not Found',
        message: 'This is the Coolvengers Backend API service.',
      });
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Coolvengers Aircons Ambassador Club server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
