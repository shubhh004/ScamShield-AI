import { History } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import EmptyState from '@/components/ui/EmptyState';

export default function HistoryPage(): JSX.Element {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-text-primary">Scan History</h1>
        <p className="mt-0.5 text-sm text-text-muted">All your previous scans</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>History</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState icon={<History className="h-7 w-7" />} title="No scan history" description="Your completed scans will appear here." />
        </CardContent>
      </Card>
    </div>
  );
}
