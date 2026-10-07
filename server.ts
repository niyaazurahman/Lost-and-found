import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import authRouter from './server/routes/auth.js';
import itemsRouter from './server/routes/items.js';
import claimsRouter from './server/routes/claims.js';
import matchesRouter from './server/routes/matches.js';
import notificationsRouter from './server/routes/notifications.js';
import adminRouter from './server/routes/admin.js';
import uploadRouter from './server/routes/upload.js';
import usersRouter from './server/routes/users.js';

dotenv.config();

const app = express();
const PORT = 3000;

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads serving
const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
app.use('/uploads', express.static(uploadsDir));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'CampusFind API', timestamp: new Date().toISOString() });
});

// Mount API routes
app.use('/api/auth', authRouter);
app.use('/api/items', itemsRouter);
app.use('/api/claims', claimsRouter);
app.use('/api/matches', matchesRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/users', usersRouter);
app.use('/api/upload', uploadRouter);

// Global API error handler
app.use('/api/*', (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('API Error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal Server Error',
  });
});

// Vite middleware for development / static serving for production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[CampusFind] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start CampusFind server:', err);
  process.exit(1);
});
