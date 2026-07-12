import { Mail } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function EmailScannerPage(): JSX.Element {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-text-primary">Email Scanner</h1>
        <p className="mt-0.5 text-sm text-text-muted">Analyse emails for phishing and social engineering</p>
      </div>
      <div className="max-w-2xl">
        <Card>
          <CardHeader><CardTitle>Scan an Email</CardTitle></CardHeader>
          <CardContent>
            <form className="flex flex-col gap-4">
              <Input label="Sender" type="email" placeholder="sender@example.com" leftIcon={<Mail className="h-4 w-4" />} />
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-text-secondary">Subject</label>
                <input className="w-full rounded-lg border border-border bg-bg-card px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-primary/60 focus:outline-none focus:ring-1 focus:ring-primary/30" placeholder="Email subject" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-text-secondary">Body</label>
                <textarea rows={6} className="w-full rounded-lg border border-border bg-bg-card px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-primary/60 focus:outline-none focus:ring-1 focus:ring-primary/30 resize-none" placeholder="Paste email body here…" />
              </div>
              <Button type="submit" className="self-start">Scan Email</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
