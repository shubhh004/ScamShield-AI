import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { logger } from './config/logger';
import { connectDatabase } from './config/db';
import { errorHandler } from './middleware/errorHandler';
import { optionalAuth } from './middleware/auth.middleware';
import authRoutes from './features/auth/auth.routes';
import scanRoutes from './features/scan-url/url.routes';
import emailRoutes from './features/scan-email/scan-email.routes';
import fileRoutes from './features/scan-file/scan-file.routes';
import smsRoutes from './features/scan-sms/sms.routes';
import qrRoutes from './features/scan-qr/qr.routes';
import imageRoutes from './features/scan-image/image.routes';
import historyRoutes from './features/history/history.routes';
import { saveHistory } from './features/history/history.service';
import type { ScanType } from './features/history/history.types';

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

// ─── History capture helpers ──────────────────────────────────────────────────

function resolveScanType(path: string): ScanType | null {
  if (path === '/url') return 'url';
  if (path === '/email') return 'email';
  if (path === '/sms') return 'sms';
  if (path === '/qr') return 'qr';
  if (path === '/image') return 'ocr';
  return null;
}

function resolveInput(
  scanType: ScanType,
  body: Record<string, unknown>,
  result: Record<string, unknown>,
): string {
  switch (scanType) {
    case 'url':
      return String(body['url'] ?? '').slice(0, 2000);
    case 'email':
      return String(body['sender'] ?? '').slice(0, 2000);
    case 'sms':
      return String(body['message'] ?? '').slice(0, 2000);
    case 'qr':
      return String(result['decoded'] ?? 'QR code image').slice(0, 2000);
    case 'ocr': {
      const ocr = result['ocr'];
      const text =
        ocr !== null && typeof ocr === 'object'
          ? String((ocr as Record<string, unknown>)['extractedText'] ?? '').trim()
          : '';
      return (text.length > 0 ? text : 'Image scan').slice(0, 2000);
    }
  }
}

function resolveRisk(
  scanType: ScanType,
  result: Record<string, unknown>,
): { riskScore: number; confidence: number } {
  switch (scanType) {
    case 'url':
    case 'email':
    case 'sms':
      return {
        riskScore: Math.min(100, Math.max(0, Number(result['riskScore'] ?? 0))),
        confidence: Math.min(100, Math.max(0, Number(result['confidence'] ?? 0))),
      };
    case 'qr': {
      const scan = result['scan'];
      const s =
        scan !== null && typeof scan === 'object' ? (scan as Record<string, unknown>) : null;
      return {
        riskScore: Math.min(100, Math.max(0, Number(s?.['riskScore'] ?? 0))),
        confidence: Math.min(100, Math.max(0, Number(s?.['confidence'] ?? 0))),
      };
    }
    case 'ocr': {
      const subKeys = ['urlScan', 'emailScan', 'smsScan'];
      const scores = subKeys
        .map((k) => result[k])
        .filter((v): v is Record<string, unknown> => v !== null && typeof v === 'object')
        .map((v) => Number(v['riskScore'] ?? 0))
        .filter((n) => !isNaN(n) && n > 0);
      return {
        riskScore: scores.length > 0 ? Math.max(...scores) : 0,
        confidence: Math.min(100, Math.max(0, Number(result['overallConfidence'] ?? 0))),
      };
    }
  }
}

function captureHistory(req: Request, res: Response, next: NextFunction): void {
  const scanType = resolveScanType(req.path);

  if (scanType === null || req.user === undefined) {
    next();
    return;
  }

  const userId = req.user.id;
  const reqBody = req.body as Record<string, unknown>;

  type JsonFn = (body?: unknown) => Response;
  const resTyped = res as unknown as { json: JsonFn };
  const originalJson: JsonFn = resTyped.json.bind(res) as JsonFn;

  resTyped.json = function (body?: unknown): Response {
    resTyped.json = originalJson;

    if (body !== null && typeof body === 'object') {
      const payload = body as Record<string, unknown>;
      if (payload['success'] === true && payload['data'] !== undefined) {
        const result = payload['data'] as Record<string, unknown>;
        const input = resolveInput(scanType, reqBody, result);
        const { riskScore, confidence } = resolveRisk(scanType, result);

        saveHistory({ userId, scanType, input, result, riskScore, confidence }).catch(
          (err: unknown) => logger.warn('Failed to save scan history', { error: String(err) }),
        );
      }
    }

    return originalJson(body);
  };

  next();
}

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
app.use('/api/v1/scan', optionalAuth(), captureHistory);
app.use('/api/v1/scan', scanRoutes);
app.use('/api/v1/scan', emailRoutes);
app.use('/api/v1/scan', fileRoutes);
app.use('/api/v1/scan', smsRoutes);
app.use('/api/v1/scan', qrRoutes);
app.use('/api/v1/scan', imageRoutes);
app.use('/api/v1/history', historyRoutes);

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
