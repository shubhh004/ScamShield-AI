import mongoose, { type Document, type Model, Schema } from 'mongoose';
import { SCAN_TYPES } from './history.types';
import type { ScanType } from './history.types';

export interface IHistory {
  userId: mongoose.Types.ObjectId;
  scanType: ScanType;
  input: string;
  result: Record<string, unknown>;
  riskScore: number;
  confidence: number;
  createdAt: Date;
}

export type HistoryDocument = IHistory & Document;

const historySchema = new Schema<HistoryDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    scanType: { type: String, enum: SCAN_TYPES, required: true },
    input: { type: String, required: true, maxlength: 2000 },
    result: { type: Schema.Types.Mixed, required: true },
    riskScore: { type: Number, required: true, min: 0, max: 100 },
    confidence: { type: Number, required: true, min: 0, max: 100, default: 0 },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

historySchema.index({ userId: 1, createdAt: -1 });
historySchema.index({ userId: 1, scanType: 1, createdAt: -1 });
historySchema.index({ userId: 1, riskScore: -1 });

export const History: Model<HistoryDocument> = mongoose.model<HistoryDocument>('History', historySchema);
