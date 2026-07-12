import { motion } from 'framer-motion';
import { Shield, TrendingUp, AlertTriangle, Clock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';

const STAT_CARDS = [
  { label: 'Total Scans', value: '—', icon: Shield, color: 'text-primary' },
  { label: 'High Risk', value: '—', icon: AlertTriangle, color: 'text-danger' },
  { label: 'This Week', value: '—', icon: TrendingUp, color: 'text-success' },
  { label: 'Last Scan', value: '—', icon: Clock, color: 'text-text-muted' },
] as const;

export default function DashboardPage(): JSX.Element {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-text-primary">Dashboard</h1>
        <p className="mt-0.5 text-sm text-text-muted">Your threat overview at a glance</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STAT_CARDS.map(({ label, value, icon: Icon, color }, i) => (
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
            <Badge variant="default">0</Badge>
          </CardHeader>
          <CardContent>
            <EmptyState title="No scans yet" description="Run your first scan to see results here." />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>High Risk Detections</CardTitle>
            <Badge variant="danger">0</Badge>
          </CardHeader>
          <CardContent>
            <EmptyState title="All clear" description="No high risk content detected." />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
