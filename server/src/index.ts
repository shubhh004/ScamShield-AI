import express, { type Request, type Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { logger } from './config/logger';
import { connectDatabase } from './config/db';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './features/auth/auth.routes';

const app = express();

// Security headers — first middleware in the chain
app.use(helmet());

// CORS — explicit origin allowlist only
app.use(
  cors({
    origin: env.ALLOWED_ORIGINS,
    credentials: true,
  }),
);

// Request logging
app.use(morgan('dev'));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ─── Routes ──────────────────────────────────────────────────────────────────

function healthResponse(_req: Request, res: Response): void {
  res.status(200).json({
    status: 'ok',
    version: '1.0.0',
  });
}

app.get('/health', healthResponse);
app.get('/api/v1/health', healthResponse);

app.use('/api/v1/auth', authRoutes);

// ─── 404 handler ─────────────────────────────────────────────────────────────

app.use((_req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    error: { code: 'NOT_FOUND', message: 'Route not found' },
  });
});

// ─── Global error handler ────────────────────────────────────────────────────

app.use(errorHandler);

// ─── Start ───────────────────────────────────────────────────────────────────

async function start(): Promise<void> {
  await connectDatabase();

  const server = app.listen(env.PORT, () => {
    logger.info('Server running', { port: env.PORT, environment: env.NODE_ENV });
  });

  process.on('SIGTERM', () => {
    server.close(() => {
      logger.info('Server closed gracefully');
      process.exit(0);
    });
  });
}

start().catch((err: unknown) => {
  logger.error('Failed to start server', { error: String(err) });
  process.exit(1);
});

export default app;
