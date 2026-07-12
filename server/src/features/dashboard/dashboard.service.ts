import mongoose from 'mongoose';
import { History } from '../history/history.model';
import type { ScanType } from '../history/history.types';
import type { DashboardData, DashboardScan, DashboardScanTypes } from './dashboard.types';

interface RawScanDoc {
  _id: mongoose.Types.ObjectId;
  scanType: ScanType;
  input: string;
  riskScore: number;
  confidence: number;
  createdAt: Date;
}

interface AggFacet {
  statsTotal: Array<{ count: number }>;
  statsHigh: Array<{ count: number }>;
  statsMedium: Array<{ count: number }>;
  statsLow: Array<{ count: number }>;
  scanTypes: Array<{ _id: string; count: number }>;
  recentScans: RawScanDoc[];
  latestHighRisk: RawScanDoc[];
}

const PROJECTION = { _id: 1, scanType: 1, input: 1, riskScore: 1, confidence: 1, createdAt: 1 };

function toScanItem(doc: RawScanDoc): DashboardScan {
  return {
    _id: doc._id.toString(),
    scanType: doc.scanType,
    input: doc.input,
    riskScore: doc.riskScore,
    confidence: doc.confidence,
    createdAt: doc.createdAt,
  };
}

function emptyDashboard(): DashboardData {
  return {
    stats: { totalScans: 0, highRisk: 0, mediumRisk: 0, lowRisk: 0 },
    scanTypes: { url: 0, email: 0, sms: 0, qr: 0, ocr: 0 },
    recentScans: [],
    latestHighRisk: [],
  };
}

export async function getDashboardData(userId: string): Promise<DashboardData> {
  const uid = new mongoose.Types.ObjectId(userId);

  const [raw] = await History.aggregate<AggFacet>([
    { $match: { userId: uid } },
    {
      $facet: {
        statsTotal: [{ $count: 'count' }],
        statsHigh: [{ $match: { riskScore: { $gte: 50 } } }, { $count: 'count' }],
        statsMedium: [{ $match: { riskScore: { $gte: 21, $lte: 49 } } }, { $count: 'count' }],
        statsLow: [{ $match: { riskScore: { $lte: 20 } } }, { $count: 'count' }],
        scanTypes: [{ $group: { _id: '$scanType', count: { $sum: 1 } } }],
        recentScans: [
          { $sort: { createdAt: -1 } },
          { $limit: 5 },
          { $project: PROJECTION },
        ],
        latestHighRisk: [
          { $match: { riskScore: { $gte: 50 } } },
          { $sort: { createdAt: -1 } },
          { $limit: 5 },
          { $project: PROJECTION },
        ],
      },
    },
  ]);

  if (raw === undefined) {
    return emptyDashboard();
  }

  const totalScans = raw.statsTotal[0]?.count ?? 0;
  const highRisk = raw.statsHigh[0]?.count ?? 0;
  const mediumRisk = raw.statsMedium[0]?.count ?? 0;
  const lowRisk = raw.statsLow[0]?.count ?? 0;

  const scanTypeMap: Record<string, number> = {};
  for (const entry of raw.scanTypes) {
    scanTypeMap[entry._id] = entry.count;
  }

  const scanTypes: DashboardScanTypes = {
    url: scanTypeMap['url'] ?? 0,
    email: scanTypeMap['email'] ?? 0,
    sms: scanTypeMap['sms'] ?? 0,
    qr: scanTypeMap['qr'] ?? 0,
    ocr: scanTypeMap['ocr'] ?? 0,
  };

  return {
    stats: { totalScans, highRisk, mediumRisk, lowRisk },
    scanTypes,
    recentScans: raw.recentScans.map(toScanItem),
    latestHighRisk: raw.latestHighRisk.map(toScanItem),
  };
}
