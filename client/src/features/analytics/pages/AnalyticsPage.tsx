import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  BarChart2,
  Shield,
  Activity,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import { getAnalytics } from '@/services/dashboard.service';
import { getApiError } from '@/utils/apiError';
import { ROUTES } from '@/constants/routes';
import type { AnalyticsData } from '@/types/dashboard';

// ── Constants ─────────────────────────────────────────────────────────────────

const TOOLTIP_STYLE = {
  backgroundColor: '#18181b',
  border: '1px solid #27272a',
  borderRadius: '8px',
  fontSize: '12px',
  color: '#e4e4e7',
};

const SCAN_TYPE_COLORS: readonly string[] = [
  '#2563eb', // URL
  '#8b5cf6', // Email
  '#22c55e', // SMS
  '#f59e0b', // QR
  '#ec4899', // OCR
];

const RISK_COLORS = {
  High: '#ef4444',
  Medium: '#f59e0b',
  Low: '#22c55e',
} as const;

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

// ── AnimatedCount ─────────────────────────────────────────────────────────────

function AnimatedCount({ value }: { value: number }): JSX.Element {
  const [count, setCount] = useState(0);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const duration = 900;
    const startTime = performance.now();

    function tick(now: number): void {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 4);
      setCount(Math.round(value * ease));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      }
    }

    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, [value]);

  return <>{count}</>;
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function SkeletonBlock({ className }: { className: string }): JSX.Element {
  return <div className={`animate-pulse rounded-lg bg-bg-elevated ${className}`} />;
}

function LoadingSkeleton(): JSX.Element {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Card key={i}>
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-2">
                <SkeletonBlock className="h-3 w-20" />
                <SkeletonBlock className="h-8 w-14" />
                <SkeletonBlock className="h-2.5 w-24" />
              </div>
              <SkeletonBlock className="h-11 w-11 rounded-xl" />
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
          <CardContent><SkeletonBlock className="h-52 w-full" /></CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader><SkeletonBlock className="h-5 w-44" /></CardHeader>
        <CardContent><SkeletonBlock className="h-40 w-full" /></CardContent>
      </Card>
      <Card>
        <CardHeader><SkeletonBlock className="h-5 w-36" /></CardHeader>
        <CardContent className="flex flex-col gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col gap-1.5">
              <div className="flex items-center gap-3">
                <SkeletonBlock className="h-5 w-5 rounded-full" />
                <SkeletonBlock className="h-3 flex-1" />
                <SkeletonBlock className="h-5 w-8 rounded-full" />
              </div>
              <SkeletonBlock className="ml-8 h-1.5 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
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
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-xl font-bold text-text-primary">Analytics</h1>
        <p className="mt-0.5 text-sm text-text-muted">Threat trends and scan statistics</p>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => { void load(); }}
        disabled={isLoading}
      >
        <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
        Refresh
      </Button>
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
              title="No scans available"
              description="Complete some scans to see your analytics."
              action={
                <Link to={ROUTES.SCAN_URL}>
                  <Button variant="secondary" size="sm">Start Scanning</Button>
                </Link>
              }
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Derived data ────────────────────────────────────────────────────────────

  const riskPieData = [
    {
      name: 'High',
      value: data.riskDistribution.high.count,
      pct: data.riskDistribution.high.percentage,
      color: RISK_COLORS.High,
    },
    {
      name: 'Medium',
      value: data.riskDistribution.medium.count,
      pct: data.riskDistribution.medium.percentage,
      color: RISK_COLORS.Medium,
    },
    {
      name: 'Low',
      value: data.riskDistribution.low.count,
      pct: data.riskDistribution.low.percentage,
      color: RISK_COLORS.Low,
    },
  ];

  const scanTypeChartData = [
    { name: 'URL', value: data.scanTypeDistribution.url },
    { name: 'Email', value: data.scanTypeDistribution.email },
    { name: 'SMS', value: data.scanTypeDistribution.sms },
    { name: 'QR', value: data.scanTypeDistribution.qr },
    { name: 'OCR', value: data.scanTypeDistribution.ocr },
  ];

  const maxThreatCount = data.topThreatReasons.reduce(
    (m, r) => Math.max(m, r.count),
    0,
  );

  const kpiCards = [
    {
      label: 'Total Scans',
      value: totalScans,
      icon: ShieldCheck,
      iconBg: 'bg-primary-muted',
      iconColor: 'text-primary',
      valueColor: 'text-text-primary',
      trend: `${data.monthScans} this month`,
    },
    {
      label: 'High Risk',
      value: data.riskDistribution.high.count,
      icon: AlertTriangle,
      iconBg: 'bg-danger-muted',
      iconColor: 'text-danger',
      valueColor: 'text-danger',
      trend: `${data.riskDistribution.high.percentage}% of scans`,
    },
    {
      label: 'Medium Risk',
      value: data.riskDistribution.medium.count,
      icon: Activity,
      iconBg: 'bg-warning-muted',
      iconColor: 'text-warning',
      valueColor: 'text-warning',
      trend: `${data.riskDistribution.medium.percentage}% of scans`,
    },
    {
      label: 'Low Risk',
      value: data.riskDistribution.low.count,
      icon: Shield,
      iconBg: 'bg-success-muted',
      iconColor: 'text-success',
      valueColor: 'text-success',
      trend: `${data.riskDistribution.low.percentage}% of scans`,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {header}

      {/* ── KPI Cards ─────────────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map(({ label, value, icon: Icon, iconBg, iconColor, valueColor, trend }, i) => (
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
                  <p className={`mt-1 text-2xl font-bold tabular-nums ${valueColor}`}>
                    <AnimatedCount value={value} />
                  </p>
                  <p className="mt-1 text-[11px] text-text-muted">{trend}</p>
                </div>
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconBg}`}>
                  <Icon className={`h-5 w-5 ${iconColor}`} />
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* ── Weekly Activity + Risk Distribution ───────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-2">

        {/* Weekly Activity */}
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
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart
                  data={data.weeklyScans}
                  margin={{ top: 4, right: 0, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="weeklyGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
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
                  <Tooltip
                    contentStyle={TOOLTIP_STYLE}
                    labelFormatter={formatChartDate}
                    cursor={{ stroke: 'rgba(255,255,255,0.08)', strokeWidth: 1 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#2563eb"
                    strokeWidth={2}
                    fill="url(#weeklyGradient)"
                    dot={false}
                    activeDot={{ r: 4, fill: '#2563eb', strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Risk Distribution */}
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
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={riskPieData}
                    cx="50%"
                    cy="44%"
                    innerRadius={52}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {riskPieData.map((entry, i) => (
                      <Cell key={`risk-cell-${i}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={TOOLTIP_STYLE}
                    formatter={(value) => {
                      const n = Number(value);
                      const pct =
                        totalScans > 0 ? Math.round((n / totalScans) * 100) : 0;
                      return `${n} scans · ${pct}%`;
                    }}
                  />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{
                      fontSize: '12px',
                      color: '#a1a1aa',
                      paddingTop: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ── Scan Type Distribution ─────────────────────────────────────────── */}
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
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                  formatter={(value) => `${String(value)} scans`}
                />
                <Bar dataKey="value" radius={4}>
                  {scanTypeChartData.map((_entry, i) => (
                    <Cell
                      key={`type-cell-${i}`}
                      fill={SCAN_TYPE_COLORS[i % SCAN_TYPE_COLORS.length] ?? '#2563eb'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Top Threat Reasons ─────────────────────────────────────────────── */}
      {data.topThreatReasons.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.28 }}
        >
          <Card glass>
            <CardHeader>
              <CardTitle>Top Threat Reasons</CardTitle>
              <span className="text-xs text-text-muted">
                {data.topThreatReasons.length} reason
                {data.topThreatReasons.length !== 1 ? 's' : ''}
              </span>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {data.topThreatReasons.map((item, i) => {
                const pct =
                  maxThreatCount > 0
                    ? Math.round((item.count / maxThreatCount) * 100)
                    : 0;
                return (
                  <div key={i} className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-3">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-bg-elevated text-[10px] font-medium tabular-nums text-text-muted">
                        {i + 1}
                      </span>
                      <p className="min-w-0 flex-1 truncate text-sm text-text-secondary">
                        {item.reason}
                      </p>
                      <Badge
                        variant={i === 0 ? 'high' : 'default'}
                        className="shrink-0 tabular-nums"
                      >
                        {item.count}
                      </Badge>
                    </div>
                    <div className="ml-8 h-1.5 w-full overflow-hidden rounded-full bg-bg-elevated">
                      <motion.div
                        className="h-1.5 rounded-full bg-primary"
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, delay: 0.05 * i }}
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
