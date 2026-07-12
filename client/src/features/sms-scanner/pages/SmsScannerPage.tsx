import { MessageSquare } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function SmsScannerPage(): JSX.Element {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-text-primary">SMS Scanner</h1>
        <p className="mt-0.5 text-sm text-text-muted">Detect smishing attempts and fraudulent texts</p>
      </div>
      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Scan an SMS</CardTitle>
            <MessageSquare className="h-4 w-4 text-text-muted" />
          </CardHeader>
          <CardContent>
            <form className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-text-secondary">Message</label>
                <textarea rows={5} className="w-full rounded-lg border border-border bg-bg-card px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-primary/60 focus:outline-none focus:ring-1 focus:ring-primary/30 resize-none" placeholder="Paste the SMS text here…" />
              </div>
              <Button type="submit" className="self-start">Scan Message</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
