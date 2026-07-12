import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  TrendingUp,
  Activity,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  BarChart2,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import { getAnalytics } from '@/services/dashboard.service';
import { getApiError } from '@/utils/apiError';
import type { AnalyticsData } from '@/types/dashboard';

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatChartDate(value: unknown): string {
  if (typeof value !== 'string') return '';
  const parts = value.split('-');
  const month = Number(parts[1] ?? '1') - 1;
  const day = Number(parts[2] ?? '1');
  return new Date(2000, month, day).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

const TOOLTIP_STYLE = {
  backgroundColor: '#18181b',
  border: '1px solid #27272a',
  borderRadius: '8px',
  fontSize: '12px',
  color: '#e4e4e7',
};

// ── Skeleton ──────────────────────────────────────────────────────────────────

function SkeletonBlock({ className }: { className: string }): JSX.Element {
  return <div className={`animate-pulse rounded-lg bg-bg-elevated ${className}`} />;
}

function LoadingSkeleton(): JSX.Element {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-2">
                <SkeletonBlock className="h-3 w-20" />
                <SkeletonBlock className="h-8 w-14" />
              </div>
              <SkeletonBlock className="h-10 w-10 rounded-lg" />
            </div>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><SkeletonBlock className="h-5 w-32" /></CardHeader>
          <CardContent><SkeletonBlock className="h-52 w-full" /></CardContent>
        </Card>
        <Card>
          <CardHeader><SkeletonBlock className="h-5 w-32" /></CardHeader>
          <CardContent className="flex flex-col gap-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex flex-col gap-1.5">
                <SkeletonBlock className="h-3 w-full" />
                <SkeletonBlock className="h-2 w-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function AnalyticsPage(): JSX.Element {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getAnalytics();
      setData(result);
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const header = (
    <div>
      <h1 className="text-xl font-bold text-text-primary">Analytics</h1>
      <p className="mt-0.5 text-sm text-text-muted">Threat trends and scan statistics</p>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        {header}
        <LoadingSkeleton />
      </div>
    );
  }

  if (error !== null || data === null) {
    return (
      <div className="flex flex-col gap-6">
        {header}
        <Card>
          <CardContent>
            <EmptyState
              icon={<AlertTriangle className="h-6 w-6" />}
              title="Failed to load analytics"
              description={error ?? 'Something went wrong. Please try again.'}
              action={
                <Button variant="secondary" size="sm" onClick={() => { void load(); }}>
                  <RefreshCw className="h-3.5 w-3.5" />
                  Retry
                </Button>
              }
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalScans =
    data.riskDistribution.low.count +
    data.riskDistribution.medium.count +
    data.riskDistribution.high.count;

  if (totalScans === 0) {
    return (
      <div className="flex flex-col gap-6">
        {header}
        <Card>
          <CardContent>
            <EmptyState
              icon={<BarChart2 className="h-6 w-6" />}
              title="No data yet"
              description="Complete some scans to see your analytics."
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Derived values ──────────────────────────────────────────────────────────

  const scanTypeChartData = [
    { name: 'URL', value: data.scanTypeDistribution.url },
    { name: 'Email', value: data.scanTypeDistribution.email },
    { name: 'SMS', value: data.scanTypeDistribution.sms },
    { name: 'QR', value: data.scanTypeDistribution.qr },
    { name: 'OCR', value: data.scanTypeDistribution.ocr },
  ];

  const riskBars = [
    {
      label: 'High',
      count: data.riskDistribution.high.count,
      pct: data.riskDistribution.high.percentage,
      bar: 'bg-danger',
      variant: 'high' as const,
    },
    {
      label: 'Medium',
      count: data.riskDistribution.medium.count,
      pct: data.riskDistribution.medium.percentage,
      bar: 'bg-warning',
      variant: 'medium' as const,
    },
    {
      label: 'Low',
      count: data.riskDistribution.low.count,
      pct: data.riskDistribution.low.percentage,
      bar: 'bg-success',
      variant: 'low' as const,
    },
  ];

  const typeEntries = Object.entries(data.scanTypeDistribution) as Array<[string, number]>;
  const topTypeEntry = typeEntries.reduce<[string, number] | null>(
    (best, curr) => (best === null || curr[1] > best[1] ? curr : best),
    null,
  );
  const mostScannedType = topTypeEntry !== null ? topTypeEntry[0].toUpperCase() : '—';

  const dominantRisk =
    data.riskDistribution.high.count > 0
      ? 'HIGH'
      : data.riskDistribution.medium.count > 0
      ? 'MEDIUM'
      : 'LOW';

  const avgRisk =
    totalScans === 0
      ? 0
      : Math.round(
          (data.riskDistribution.low.count * 10 +
            data.riskDistribution.medium.count * 35 +
            data.riskDistribution.high.count * 75) /
            totalScans,
        );

  const topThreat = data.topThreatReasons[0]?.reason ?? null;

  const statCards = [
    { label: 'Today', value: data.todayScans, icon: Calendar, color: 'text-primary' },
    { label: 'This Week', value: data.weekScans, icon: TrendingUp, color: 'text-success' },
    { label: 'This Month', value: data.monthScans, icon: Activity, color: 'text-warning' },
    { label: 'Total Scans', value: totalScans, icon: ShieldCheck, color: 'text-primary' },
  ];

  return (
    <div className="flex flex-col gap-6">
      {header}

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map(({ label, value, icon: Icon, color }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: i * 0.06 }}
          >
            <Card glass>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-text-muted">{label}</p>
                  <p className="mt-1 text-2xl font-bold tabular-nums text-text-primary">{value}</p>
                </div>
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-bg-elevated ${color}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Weekly activity + Risk distribution */}
      <div className="grid gap-4 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.1 }}
        >
          <Card glass>
            <CardHeader>
              <CardTitle>Weekly Activity</CardTitle>
              <Badge variant="default">{data.weekScans} this week</Badge>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={208}>
                <BarChart
                  data={data.weeklyScans}
                  margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
                >
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: '#71717a' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={formatChartDate}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#71717a' }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                  <Bar dataKey="count" fill="#2563eb" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.16 }}
        >
          <Card glass>
            <CardHeader>
              <CardTitle>Risk Distribution</CardTitle>
              <Badge variant="default">{totalScans} total</Badge>
            </CardHeader>
            <CardContent className="flex flex-col gap-5 pt-2">
              {riskBars.map(({ label, count, pct, bar, variant }) => (
                <div key={label} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant={variant}>{label}</Badge>
                    </div>
                    <span className="text-xs text-text-muted">
                      {count} scan{count !== 1 ? 's' : ''} · {pct}%
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-bg-elevated">
                    <motion.div
                      className={`h-2 rounded-full ${bar}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, delay: 0.3 }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Scan type distribution */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.22 }}
      >
        <Card glass>
          <CardHeader>
            <CardTitle>Scan Type Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart
                data={scanTypeChartData}
                layout="vertical"
                margin={{ top: 0, right: 16, left: 10, bottom: 0 }}
              >
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: '#71717a' }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  tick={{ fontSize: 11, fill: '#71717a' }}
                  axisLine={false}
                  tickLine={false}
                  width={42}
                />
                <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                <Bar dataKey="value" fill="#2563eb" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent statistics */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.28 }}
      >
        <Card glass>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col gap-1 rounded-lg border border-border bg-bg-elevated p-4">
                <p className="text-xs text-text-muted">Most Scanned</p>
                <p className="mt-1 text-base font-semibold text-text-primary">{mostScannedType}</p>
              </div>
              <div className="flex flex-col gap-1 rounded-lg border border-border bg-bg-elevated p-4">
                <p className="text-xs text-text-muted">Dominant Risk</p>
                <div className="mt-1">
                  <Badge
                    variant={
                      dominantRisk === 'HIGH' ? 'high' : dominantRisk === 'MEDIUM' ? 'medium' : 'low'
                    }
                  >
                    {dominantRisk}
                  </Badge>
                </div>
              </div>
              <div className="flex flex-col gap-1 rounded-lg border border-border bg-bg-elevated p-4">
                <p className="text-xs text-text-muted">Avg Risk Score</p>
                <p className="mt-1 text-base font-semibold tabular-nums text-text-primary">
                  ~{avgRisk}
                </p>
              </div>
              <div className="flex flex-col gap-1 rounded-lg border border-border bg-bg-elevated p-4">
                <p className="text-xs text-text-muted">High Risk Total</p>
                <p className="mt-1 text-base font-semibold tabular-nums text-danger">
                  {data.riskDistribution.high.count}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Top threat reasons */}
      {data.topThreatReasons.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.34 }}
        >
          <Card glass>
            <CardHeader>
              <CardTitle>Top Threat Reasons</CardTitle>
              {topThreat !== null && (
                <span className="text-xs text-text-muted">Most common: {topThreat}</span>
              )}
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                {data.topThreatReasons.map((item, i) => (
                  <div key={i} className="flex items-center justify-between gap-3">
                    <p className="flex-1 text-xs text-text-secondary">{item.reason}</p>
                    <Badge variant="default" className="shrink-0 tabular-nums">
                      {item.count}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
