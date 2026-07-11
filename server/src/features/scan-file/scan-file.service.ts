import { randomUUID, createHash } from 'crypto';
import path from 'path';
import { logger } from '../../config/logger';
import { ValidationError } from '../../lib/errors';
import type { FileScanInput, FileScanResult } from './scan-file.types';
import type { RiskLevel } from '../scan-url/risk.types';

// ── Constants ──────────────────────────────────────────────────────────────────

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const EXECUTABLE_EXTS = new Set(['.exe', '.bat', '.cmd', '.scr', '.js', '.vbs', '.dll', '.msi']);

// ── Helpers ────────────────────────────────────────────────────────────────────

function toRiskLevel(score: number): RiskLevel {
  if (score <= 20) return 'LOW';
  if (score <= 49) return 'MEDIUM';
  return 'HIGH';
}

function getExtension(filename: string): string {
  return path.extname(filename).toLowerCase();
}

// Fires only when the outermost extension is executable AND a second extension
// exists — the tell-tale sign of a disguised payload (e.g. invoice.pdf.exe).
function hasDoubleExtension(filename: string, outerExt: string): boolean {
  if (!EXECUTABLE_EXTS.has(outerExt)) return false;
  const stem = filename.slice(0, filename.length - outerExt.length);
  return path.extname(stem) !== '';
}

// ── Service ────────────────────────────────────────────────────────────────────

export async function scanFile(input: FileScanInput): Promise<FileScanResult> {
  const { originalname, mimetype, size, buffer } = input;

  // Belt-and-suspenders size guard (multer limit is the primary gate)
  if (size > MAX_FILE_SIZE) {
    throw new ValidationError('File size exceeds 10 MB limit');
  }

  const scanId = randomUUID();
  const extension = getExtension(originalname);

  let score = 0;
  const reasons: string[] = [];

  // Rule: Empty file
  if (size === 0) {
    score += 50;
    reasons.push('Empty file');
  }

  // Rule: Dangerous executable extension
  if (EXECUTABLE_EXTS.has(extension)) {
    score += 75;
    reasons.push(`Dangerous executable extension: ${extension}`);
  }

  // Rule: Double extension (e.g. invoice.pdf.exe, photo.jpg.scr)
  if (hasDoubleExtension(originalname, extension)) {
    score += 60;
    reasons.push('Double file extension detected');
  }

  const sha256 = createHash('sha256').update(buffer).digest('hex');
  const riskScore = Math.min(100, score);
  const riskLevel = toRiskLevel(riskScore);

  logger.info('File scan complete', {
    scanId,
    filename: originalname,
    extension,
    size,
    riskScore,
    riskLevel,
  });

  return {
    scanId,
    filename: originalname,
    extension,
    mimeType: mimetype,
    size,
    sha256,
    riskScore,
    riskLevel,
    reasons,
  };
}
