import { Link2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function UrlScannerPage(): JSX.Element {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-text-primary">URL Scanner</h1>
        <p className="mt-0.5 text-sm text-text-muted">Detect phishing links and malicious domains</p>
      </div>
      <div className="max-w-2xl">
        <Card>
          <CardHeader><CardTitle>Scan a URL</CardTitle></CardHeader>
          <CardContent>
            <form className="flex flex-col gap-4">
              <Input
                label="URL"
                type="url"
                placeholder="https://example.com"
                leftIcon={<Link2 className="h-4 w-4" />}
              />
              <Button type="submit" className="self-start">Scan URL</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
