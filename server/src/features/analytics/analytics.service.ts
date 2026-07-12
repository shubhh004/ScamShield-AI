import mongoose from 'mongoose';
import { History } from '../history/history.model';
import type {
  AnalyticsData,
  DailyScan,
  RiskDistribution,
  ScanTypeDistribution,
  ThreatReason,
} from './analytics.types';

// ── Internal aggregation result type ─────────────────────────────────────────

interface AggFacet {
  periodToday: Array<{ count: number }>;
  periodWeek: Array<{ count: number }>;
  periodMonth: Array<{ count: number }>;
  totalCount: Array<{ count: number }>;
  riskLow: Array<{ count: number }>;
  riskMedium: Array<{ count: number }>;
  riskHigh: Array<{ count: number }>;
  scanTypeDist: Array<{ _id: string; count: number }>;
  weeklyScans: Array<{ _id: string; count: number }>;
  topThreats: Array<{ _id: string; count: number }>;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function utcDayStart(offsetDays = 0): Date {
  const d = new Date();
  const base = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  return new Date(base - offsetDays * 86_400_000);
}

function toPercent(count: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((count / total) * 1000) / 10;
}

function buildWeekDates(weekStart: Date): string[] {
  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    dates.push(new Date(weekStart.getTime() + i * 86_400_000).toISOString().slice(0, 10));
  }
  return dates;
}

function emptyAnalytics(): AnalyticsData {
  const empty = { count: 0, percentage: 0 };
  return {
    todayScans: 0,
    weekScans: 0,
    monthScans: 0,
    riskDistribution: { low: empty, medium: empty, high: empty },
    scanTypeDistribution: { url: 0, email: 0, sms: 0, qr: 0, ocr: 0 },
    weeklyScans: buildWeekDates(utcDayStart(6)).map((date) => ({ date, count: 0 })),
    topThreatReasons: [],
  };
}

// ── Service ───────────────────────────────────────────────────────────────────

export async function getAnalyticsData(userId: string): Promise<AnalyticsData> {
  const uid = new mongoose.Types.ObjectId(userId);

  const todayStart = utcDayStart(0);
  const weekStart = utcDayStart(6);
  const monthStart = utcDayStart(29);

  const [raw] = await History.aggregate<AggFacet>([
    { $match: { userId: uid } },
    {
      $facet: {
        periodToday: [{ $match: { createdAt: { $gte: todayStart } } }, { $count: 'count' }],
        periodWeek: [{ $match: { createdAt: { $gte: weekStart } } }, { $count: 'count' }],
        periodMonth: [{ $match: { createdAt: { $gte: monthStart } } }, { $count: 'count' }],
        totalCount: [{ $count: 'count' }],
        riskLow: [{ $match: { riskScore: { $lte: 20 } } }, { $count: 'count' }],
        riskMedium: [{ $match: { riskScore: { $gte: 21, $lte: 49 } } }, { $count: 'count' }],
        riskHigh: [{ $match: { riskScore: { $gte: 50 } } }, { $count: 'count' }],
        scanTypeDist: [{ $group: { _id: '$scanType', count: { $sum: 1 } } }],
        weeklyScans: [
          { $match: { createdAt: { $gte: weekStart } } },
          {
            $group: {
              _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ],
        topThreats: [
          { $match: { riskScore: { $gte: 50 } } },
          { $unwind: '$result.reasons' },
          { $group: { _id: '$result.reasons', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 },
        ],
      },
    },
  ]);

  if (raw === undefined) {
    return emptyAnalytics();
  }

  // ── Period counts ─────────────────────────────────────────────────────────

  const todayScans = raw.periodToday[0]?.count ?? 0;
  const weekScans = raw.periodWeek[0]?.count ?? 0;
  const monthScans = raw.periodMonth[0]?.count ?? 0;

  // ── Risk distribution ─────────────────────────────────────────────────────

  const total = raw.totalCount[0]?.count ?? 0;
  const lowCount = raw.riskLow[0]?.count ?? 0;
  const mediumCount = raw.riskMedium[0]?.count ?? 0;
  const highCount = raw.riskHigh[0]?.count ?? 0;

  const riskDistribution: RiskDistribution = {
    low: { count: lowCount, percentage: toPercent(lowCount, total) },
    medium: { count: mediumCount, percentage: toPercent(mediumCount, total) },
    high: { count: highCount, percentage: toPercent(highCount, total) },
  };

  // ── Scan type distribution ────────────────────────────────────────────────

  const scanTypeMap: Record<string, number> = {};
  for (const entry of raw.scanTypeDist) {
    scanTypeMap[entry._id] = entry.count;
  }

  const scanTypeDistribution: ScanTypeDistribution = {
    url: scanTypeMap['url'] ?? 0,
    email: scanTypeMap['email'] ?? 0,
    sms: scanTypeMap['sms'] ?? 0,
    qr: scanTypeMap['qr'] ?? 0,
    ocr: scanTypeMap['ocr'] ?? 0,
  };

  // ── Weekly scans (fill missing days with 0) ───────────────────────────────

  const weeklyMap: Record<string, number> = {};
  for (const entry of raw.weeklyScans) {
    weeklyMap[entry._id] = entry.count;
  }

  const weeklyScans: DailyScan[] = buildWeekDates(weekStart).map((date) => ({
    date,
    count: weeklyMap[date] ?? 0,
  }));

  // ── Top threat reasons ────────────────────────────────────────────────────

  const topThreatReasons: ThreatReason[] = raw.topThreats.map((entry) => ({
    reason: entry._id,
    count: entry.count,
  }));

  return {
    todayScans,
    weekScans,
    monthScans,
    riskDistribution,
    scanTypeDistribution,
    weeklyScans,
    topThreatReasons,
  };
}
