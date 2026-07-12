import { QrCode, Upload } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function QrScannerPage(): JSX.Element {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-text-primary">QR Scanner</h1>
        <p className="mt-0.5 text-sm text-text-muted">Decode and verify QR codes before following links</p>
      </div>
      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Scan a QR Code</CardTitle>
            <QrCode className="h-4 w-4 text-text-muted" />
          </CardHeader>
          <CardContent>
            <form className="flex flex-col gap-4">
              <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-bg-elevated py-10 hover:border-primary/40 transition-colors">
                <Upload className="h-7 w-7 text-text-muted" />
                <span className="text-sm text-text-muted">Click to upload a QR code image</span>
                <input type="file" accept="image/*" className="hidden" />
              </label>
              <Button type="submit" className="self-start">Scan QR Code</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
