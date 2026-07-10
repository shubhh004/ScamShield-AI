import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { logger } from './config/logger';
import { AppError } from './lib/errors';

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

// ─── 404 handler ─────────────────────────────────────────────────────────────

app.use((_req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    error: { code: 'NOT_FOUND', message: 'Route not found' },
  });
});

// ─── Global error handler ────────────────────────────────────────────────────

app.use((err: Error, _req: Request, res: Response, _next: NextFunction): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: { code: err.code, message: err.message },
    });
    return;
  }

  logger.error('Unhandled error', { message: err.message, stack: err.stack });
  res.status(500).json({
    success: false,
    error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' },
  });
});

// ─── Start ───────────────────────────────────────────────────────────────────

const server = app.listen(env.PORT, () => {
  logger.info(`Server running`, { port: env.PORT, environment: env.NODE_ENV });
});

process.on('SIGTERM', () => {
  server.close(() => {
    logger.info('Server closed gracefully');
    process.exit(0);
  });
});

export default app;
