import mongoose from 'mongoose';
import { History } from './history.model';
import { ForbiddenError, NotFoundError } from '../../lib/errors';
import type { HistoryDocument } from './history.model';
import type { HistoryListQuery, PaginationMeta, ScanType } from './history.types';

const RISK_RANGES: Record<'LOW' | 'MEDIUM' | 'HIGH', { $gte: number; $lte: number }> = {
  LOW: { $gte: 0, $lte: 20 },
  MEDIUM: { $gte: 21, $lte: 49 },
  HIGH: { $gte: 50, $lte: 100 },
};

export interface SaveHistoryInput {
  userId: string;
  scanType: ScanType;
  input: string;
  result: Record<string, unknown>;
  riskScore: number;
  confidence: number;
}

export async function saveHistory(payload: SaveHistoryInput): Promise<void> {
  await History.create({
    userId: new mongoose.Types.ObjectId(payload.userId),
    scanType: payload.scanType,
    input: payload.input,
    result: payload.result,
    riskScore: payload.riskScore,
    confidence: payload.confidence,
  });
}

export async function listHistory(
  userId: string,
  query: HistoryListQuery,
): Promise<{ items: HistoryDocument[]; pagination: PaginationMeta }> {
  const page = Math.max(1, query.page ?? 1);
  const limit = Math.min(100, Math.max(1, query.limit ?? 10));
  const skip = (page - 1) * limit;
  const sortOrder: 1 | -1 = query.sort === 'asc' ? 1 : -1;

  const filter: mongoose.FilterQuery<HistoryDocument> = {
    userId: new mongoose.Types.ObjectId(userId),
  };

  if (query.risk !== undefined) {
    filter['riskScore'] = RISK_RANGES[query.risk];
  }

  if (query.type !== undefined) {
    filter['scanType'] = query.type;
  }

  const [items, total] = await Promise.all([
    History.find(filter).sort({ createdAt: sortOrder }).skip(skip).limit(limit).lean(),
    History.countDocuments(filter),
  ]);

  return {
    items: items as unknown as HistoryDocument[],
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
}

export async function getHistoryById(userId: string, id: string): Promise<HistoryDocument> {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new NotFoundError('History entry');
  }

  const entry = await History.findById(id).lean();

  if (entry === null) {
    throw new NotFoundError('History entry');
  }

  if ((entry.userId as mongoose.Types.ObjectId).toString() !== userId) {
    throw new ForbiddenError();
  }

  return entry as unknown as HistoryDocument;
}

export async function deleteHistoryById(userId: string, id: string): Promise<void> {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new NotFoundError('History entry');
  }

  const entry = await History.findById(id);

  if (entry === null) {
    throw new NotFoundError('History entry');
  }

  if (entry.userId.toString() !== userId) {
    throw new ForbiddenError();
  }

  await entry.deleteOne();
}
