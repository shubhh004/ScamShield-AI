import { BarChart2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import EmptyState from '@/components/ui/EmptyState';

export default function AnalyticsPage(): JSX.Element {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-text-primary">Analytics</h1>
        <p className="mt-0.5 text-sm text-text-muted">Threat trends and scan statistics</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Weekly Scans</CardTitle></CardHeader>
          <CardContent>
            <EmptyState icon={<BarChart2 className="h-6 w-6" />} title="No data yet" description="Scan history will populate this chart." />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Risk Distribution</CardTitle></CardHeader>
          <CardContent>
            <EmptyState icon={<BarChart2 className="h-6 w-6" />} title="No data yet" description="Risk breakdown will appear after your first scan." />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
