import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import {
  Shield,
  AlertTriangle,
  Activity,
  CheckCircle,
  RefreshCw,
  Link2,
  Mail,
  MessageSquare,
  QrCode,
  Image as ImageIcon,
  Zap,
  TrendingUp,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import {
  AreaChart,
  Area,
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
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';
import * as dashboardService from '@/services/dashboard.service';
import type { DashboardData, AnalyticsData, DashboardScan, ScanType } from '@/types/dashboard';

// ── Types ─────────────────────────────────────────────────────────────────────

interface ScanTypeStyle {
  icon: LucideIcon;
  bg: string;
  color: string;
}

interface InsightItem {
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  label: string;
  value: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const TOOLTIP_STYLE = {
  backgroundColor: '#18181b',
  border: '1px solid #27272a',
  borderRadius: '8px',
  fontSize: '12px',
  color: '#e4e4e7',
};

const SCAN_TYPE_STYLES: Record<ScanType, ScanTypeStyle> = {
  url:   { icon: Link2,         bg: '#2563eb1a', color: '#2563eb' },
  email: { icon: Mail,          bg: '#8b5cf61a', color: '#8b5cf6' },
  sms:   { icon: MessageSquare, bg: '#22c55e1a', color: '#22c55e' },
  qr:    { icon: QrCode,        bg: '#f59e0b1a', color: '#f59e0b' },
  ocr:   { icon: ImageIcon,     bg: '#ec48991a', color: '#ec4899' },
};

const QUICK_ACTIONS: ReadonlyArray<{ label: string; icon: LucideIcon; route: string }> = [
  { label: 'Scan URL',   icon: Link2,         route: ROUTES.SCAN_URL   },
  { label: 'Scan Email', icon: Mail,          route: ROUTES.SCAN_EMAIL },
  { label: 'Scan SMS',   icon: MessageSquare, route: ROUTES.SCAN_SMS   },
  { label: 'Scan QR',    icon: QrCode,        route: ROUTES.SCAN_QR    },
  { label: 'Scan Image', icon: ImageIcon,     route: ROUTES.SCAN_IMAGE },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatChartDate(value: unknown): string {
  if (typeof value !== 'string') return '';
  const parts = value.split('-');
  const month = Number(parts[1] ?? '1') - 1;
  const day = Number(parts[2] ?? '1');
  return new Date(2000, month, day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

type RiskVariant = 'high' | 'medium' | 'low';

function riskVariant(score: number): RiskVariant {
  if (score >= 50) return 'high';
  if (score >= 21) return 'medium';
  return 'low';
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

// ── ActivityItem ──────────────────────────────────────────────────────────────

function ActivityItem({ scan, onClick }: { scan: DashboardScan; onClick: () => void }): JSX.Element {
  const typeStyle = SCAN_TYPE_STYLES[scan.scanType];
  const ScanIcon = typeStyle.icon;
  const variant = riskVariant(scan.riskScore);
  const preview = scan.input.length > 42 ? `${scan.input.slice(0, 42)}…` : scan.input;

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-lg p-2.5 text-left transition-colors hover:bg-bg-elevated"
    >
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
        style={{ backgroundColor: typeStyle.bg }}
      >
        <ScanIcon className="h-4 w-4" style={{ color: typeStyle.color }} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs text-text-secondary">{preview}</p>
        <p className="text-[11px] text-text-muted">{timeAgo(scan.createdAt)}</p>
      </div>
      <Badge variant={variant} className="shrink-0 tabular-nums text-[10px]">
        {scan.riskScore}
      </Badge>
    </button>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function SkeletonBlock({ className }: { className: string }): JSX.Element {
  return <div className={`animate-pulse rounded-lg bg-bg-elevated ${className}`} />;
}

function LoadingSkeleton(): JSX.Element {
  return (
    <div className="flex flex-col gap-6">
      <Card glass><SkeletonBlock className="h-16 w-full" /></Card>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
        {[0, 1, 2, 3, 4].map((i) => (
          <Card key={i}><SkeletonBlock className="h-16 w-full" /></Card>
        ))}
      </div>
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
          <CardContent className="flex flex-col gap-2.5">
            {[0, 1, 2, 3, 4].map((i) => (
              <SkeletonBlock key={i} className="h-12 w-full" />
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><SkeletonBlock className="h-5 w-32" /></CardHeader>
          <CardContent className="flex flex-col gap-3">
            {[0, 1, 2, 3].map((i) => (
              <SkeletonBlock key={i} className="h-12 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function DashboardPage(): JSX.Element {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dashData, setDashData] = useState<DashboardData | null>(null);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const [dashResult, analyticsResult] = await Promise.allSettled([
        dashboardService.getDashboard(),
        dashboardService.getAnalytics(),
      ]);
      if (dashResult.status === 'fulfilled') {
        setDashData(dashResult.value);
      } else {
        setError('Failed to load dashboard data. Please try again.');
      }
      if (analyticsResult.status === 'fulfilled') {
        setAnalyticsData(analyticsResult.value);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const firstName = user?.name.split(' ')[0] ?? 'there';
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  // Reused in both empty and populated states
  const heroSection = (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <Card glass>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-text-muted">{today}</p>
            <h1 className="mt-1 text-xl font-bold text-text-primary">
              Welcome back, {firstName}
            </h1>
            <p className="mt-0.5 text-sm text-text-muted">
              Stay one step ahead of online scams.
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-muted">
            <Shield className="h-6 w-6 text-primary" />
          </div>
        </div>
      </Card>
    </motion.div>
  );

  const quickActionsSection = (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: 0.05 }}
    >
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
        {QUICK_ACTIONS.map(({ label, icon: Icon, route }) => (
          <Link key={route} to={route}>
            <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.15 }}>
              <Card glass className="cursor-pointer p-3">
                <div className="flex flex-col items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-muted">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-center text-[11px] font-medium leading-tight text-text-secondary">
                    {label}
                  </span>
                </div>
              </Card>
            </motion.div>
          </Link>
        ))}
      </div>
    </motion.div>
  );

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error !== null || dashData === null) {
    return (
      <div className="flex flex-col gap-6">
        {heroSection}
        <Card>
          <EmptyState
            icon={<AlertTriangle className="h-6 w-6" />}
            title="Failed to load dashboard"
            description={error ?? 'Something went wrong. Please try again.'}
            action={
              <Button variant="secondary" size="sm" onClick={() => { void load(); }}>
                <RefreshCw className="h-3.5 w-3.5" />
                Retry
              </Button>
            }
          />
        </Card>
      </div>
    );
  }

  const { stats, recentScans, latestHighRisk } = dashData;

  if (stats.totalScans === 0) {
    return (
      <div className="flex flex-col gap-6">
        {heroSection}
        {quickActionsSection}
        <Card>
          <EmptyState
            icon={<Shield className="h-6 w-6" />}
            title="Start your first scan to see insights"
            description="ScamShield AI will analyse threats and provide a full security overview."
            action={
              <Link to={ROUTES.SCAN_URL}>
                <Button>Start Scanning</Button>
              </Link>
            }
          />
        </Card>
      </div>
    );
  }

  // ── Derived values ──────────────────────────────────────────────────────────

  const statCards = [
    {
      label: 'Total Scans',
      value: stats.totalScans,
      icon: Shield,
      iconBg: 'bg-primary-muted',
      iconColor: 'text-primary',
      valueColor: 'text-text-primary',
      description: 'All-time scans',
      accentColor: '#2563eb',
    },
    {
      label: 'High Risk',
      value: stats.highRisk,
      icon: AlertTriangle,
      iconBg: 'bg-danger-muted',
      iconColor: 'text-danger',
      valueColor: 'text-danger',
      description: 'Threats detected',
      accentColor: '#ef4444',
    },
    {
      label: 'Medium Risk',
      value: stats.mediumRisk,
      icon: Activity,
      iconBg: 'bg-warning-muted',
      iconColor: 'text-warning',
      valueColor: 'text-warning',
      description: 'Needs attention',
      accentColor: '#f59e0b',
    },
    {
      label: 'Low Risk',
      value: stats.lowRisk,
      icon: CheckCircle,
      iconBg: 'bg-success-muted',
      iconColor: 'text-success',
      valueColor: 'text-success',
      description: 'Safe content',
      accentColor: '#22c55e',
    },
  ];

  let insights: InsightItem[] | null = null;

  if (analyticsData !== null) {
    const scanTypeEntries = Object.entries(analyticsData.scanTypeDistribution) as Array<
      [string, number]
    >;
    const topTypeEntry = scanTypeEntries.reduce<[string, number] | null>(
      (best, curr) => (best === null || curr[1] > best[1] ? curr : best),
      null,
    );
    const mostCommon = topTypeEntry !== null ? topTypeEntry[0].toUpperCase() : 'None';
    const highPct = analyticsData.riskDistribution.high.percentage;
    const aiRec =
      highPct > 20
        ? 'Review high-risk content carefully'
        : analyticsData.riskDistribution.high.count > 0
        ? 'Some threats detected, stay vigilant'
        : 'Clean profile — keep scanning regularly';

    insights = [
      {
        icon: Zap,
        iconBg: 'bg-primary-muted',
        iconColor: 'text-primary',
        label: 'Most Scanned',
        value: mostCommon,
      },
      {
        icon: TrendingUp,
        iconBg: 'bg-danger-muted',
        iconColor: 'text-danger',
        label: 'High Risk Rate',
        value: `${highPct}% of all scans`,
      },
      {
        icon: Activity,
        iconBg: 'bg-success-muted',
        iconColor: 'text-success',
        label: 'This Week',
        value: `${analyticsData.weekScans} scan${analyticsData.weekScans !== 1 ? 's' : ''}`,
      },
      {
        icon: ShieldCheck,
        iconBg: highPct > 20 ? 'bg-warning-muted' : 'bg-success-muted',
        iconColor: highPct > 20 ? 'text-warning' : 'text-success',
        label: 'AI Recommendation',
        value: aiRec,
      },
    ];
  }

  return (
    <div className="flex flex-col gap-6">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      {heroSection}

      {/* ── Quick Actions ─────────────────────────────────────────────────── */}
      {quickActionsSection}

      {/* ── Stat Cards ────────────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map(
          (
            { label, value, icon: Icon, iconBg, iconColor, valueColor, description, accentColor },
            i,
          ) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.1 + i * 0.06 }}
              whileHover={{ y: -2 }}
            >
              <Card
                glass
                style={{ borderLeftWidth: '2px', borderLeftColor: accentColor }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-text-muted">{label}</p>
                    <p className={`mt-1 text-2xl font-bold tabular-nums ${valueColor}`}>
                      <AnimatedCount value={value} />
                    </p>
                    <p className="mt-1 text-[11px] text-text-muted">{description}</p>
                  </div>
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconBg}`}>
                    <Icon className={`h-5 w-5 ${iconColor}`} />
                  </div>
                </div>
              </Card>
            </motion.div>
          ),
        )}
      </div>

      {/* ── Recent Activity + Security Insights ───────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-2">

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.34 }}
        >
          <Card glass>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <Link
                to={ROUTES.HISTORY}
                className="flex items-center gap-1 text-xs text-text-muted transition-colors hover:text-text-secondary"
              >
                View all
                <ChevronRight className="h-3 w-3" />
              </Link>
            </CardHeader>
            <CardContent>
              {recentScans.length === 0 ? (
                <EmptyState
                  title="No scans yet"
                  description="Run your first scan to see results here."
                  className="py-8"
                />
              ) : (
                <div className="flex flex-col">
                  {recentScans.map((scan) => (
                    <ActivityItem
                      key={scan._id}
                      scan={scan}
                      onClick={() => { navigate(ROUTES.HISTORY); }}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Security Insights or High Risk fallback */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.4 }}
        >
          {insights !== null ? (
            <Card glass>
              <CardHeader>
                <CardTitle>Security Insights</CardTitle>
                <ShieldCheck className="h-4 w-4 text-text-muted" />
              </CardHeader>
              <CardContent className="flex flex-col divide-y divide-border">
                {insights.map((item) => {
                  const InsightIcon = item.icon;
                  return (
                    <div
                      key={item.label}
                      className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                    >
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${item.iconBg}`}
                      >
                        <InsightIcon className={`h-4 w-4 ${item.iconColor}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-text-primary">{item.label}</p>
                        <p className="truncate text-[11px] text-text-muted">{item.value}</p>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          ) : (
            <Card glass>
              <CardHeader>
                <CardTitle>High Risk Detections</CardTitle>
                <Badge variant="danger">{latestHighRisk.length}</Badge>
              </CardHeader>
              <CardContent>
                {latestHighRisk.length === 0 ? (
                  <EmptyState
                    title="All clear"
                    description="No high risk content detected."
                    className="py-8"
                  />
                ) : (
                  <div className="flex flex-col">
                    {latestHighRisk.map((scan) => (
                      <ActivityItem
                        key={scan._id}
                        scan={scan}
                        onClick={() => { navigate(ROUTES.HISTORY); }}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>

      {/* ── Weekly Activity Chart ──────────────────────────────────────────── */}
      {analyticsData !== null && analyticsData.weeklyScans.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.46 }}
        >
          <Card glass>
            <CardHeader>
              <CardTitle>Weekly Activity</CardTitle>
              <Badge variant="default">{analyticsData.weekScans} this week</Badge>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart
                  data={analyticsData.weeklyScans}
                  margin={{ top: 4, right: 0, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="dashGradient" x1="0" y1="0" x2="0" y2="1">
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
                    fill="url(#dashGradient)"
                    dot={false}
                    activeDot={{ r: 4, fill: '#2563eb', strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
