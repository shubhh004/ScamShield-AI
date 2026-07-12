import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, TrendingUp, CheckCircle, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import { SectionLoader } from '@/components/ui/Loading';
import { ROUTES } from '@/constants/routes';
import * as dashboardService from '@/services/dashboard.service';
import type { DashboardData, AnalyticsData, DashboardScan } from '@/types/dashboard';

type RiskVariant = 'high' | 'medium' | 'low';

function riskVariant(score: number): RiskVariant {
  if (score >= 50) return 'high';
  if (score >= 21) return 'medium';
  return 'low';
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

function ScanRow({ scan }: { scan: DashboardScan }): JSX.Element {
  const variant = riskVariant(scan.riskScore);
  const input = scan.input.length > 48 ? `${scan.input.slice(0, 48)}…` : scan.input;
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-border last:border-0">
      <Badge variant="default" className="shrink-0 uppercase text-[10px]">
        {scan.scanType}
      </Badge>
      <span className="flex-1 truncate text-xs text-text-secondary">{input}</span>
      <Badge variant={variant}>{scan.riskScore}</Badge>
      <span className="shrink-0 text-xs text-text-muted">{timeAgo(scan.createdAt)}</span>
    </div>
  );
}

function formatChartDate(value: unknown): string {
  if (typeof value !== 'string') return '';
  const parts = value.split('-');
  const month = Number(parts[1] ?? '1') - 1;
  const day = Number(parts[2] ?? '1');
  return new Date(2000, month, day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function DashboardPage(): JSX.Element {
  const navigate = useNavigate();
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

  const header = (
    <div>
      <h1 className="text-xl font-bold text-text-primary">Dashboard</h1>
      <p className="mt-0.5 text-sm text-text-muted">Your threat overview at a glance</p>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        {header}
        <SectionLoader />
      </div>
    );
  }

  if (error !== null || dashData === null) {
    return (
      <div className="flex flex-col gap-6">
        {header}
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
        {header}
        <Card>
          <EmptyState
            icon={<Shield className="h-6 w-6" />}
            title="No scans yet"
            description="Run your first scan to start protecting yourself with ScamShield AI."
            action={
              <Button onClick={() => { navigate(ROUTES.SCAN_URL); }}>
                Start your first scan
              </Button>
            }
          />
        </Card>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Scans', value: stats.totalScans, icon: Shield, color: 'text-primary' },
    { label: 'High Risk', value: stats.highRisk, icon: AlertTriangle, color: 'text-danger' },
    { label: 'Medium Risk', value: stats.mediumRisk, icon: TrendingUp, color: 'text-warning' },
    { label: 'Low Risk', value: stats.lowRisk, icon: CheckCircle, color: 'text-success' },
  ];

  return (
    <div className="flex flex-col gap-6">
      {header}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map(({ label, value, icon: Icon, color }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.06 }}
          >
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-text-muted">{label}</p>
                  <p className="mt-1 text-2xl font-bold text-text-primary">{value}</p>
                </div>
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-bg-elevated ${color}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Scans</CardTitle>
            <Badge variant="default">{recentScans.length}</Badge>
          </CardHeader>
          <CardContent>
            {recentScans.length === 0 ? (
              <EmptyState title="No scans yet" description="Run your first scan to see results here." />
            ) : (
              <div>
                {recentScans.map((scan) => (
                  <ScanRow key={scan._id} scan={scan} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>High Risk Detections</CardTitle>
            <Badge variant="danger">{latestHighRisk.length}</Badge>
          </CardHeader>
          <CardContent>
            {latestHighRisk.length === 0 ? (
              <EmptyState title="All clear" description="No high risk content detected." />
            ) : (
              <div>
                {latestHighRisk.map((scan) => (
                  <ScanRow key={scan._id} scan={scan} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {analyticsData !== null && analyticsData.weeklyScans.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Weekly Scans</CardTitle>
            <Badge variant="default">{analyticsData.weekScans} this week</Badge>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={analyticsData.weeklyScans}
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
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    border: '1px solid #27272a',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#e4e4e7',
                  }}
                  cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                />
                <Bar dataKey="count" fill="#2563eb" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
