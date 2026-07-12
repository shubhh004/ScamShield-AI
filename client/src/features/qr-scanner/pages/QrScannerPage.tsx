import { useState } from 'react';
import { QrCode, Upload, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { scanQr } from '@/services/scanner.service';
import { getApiError } from '@/utils/apiError';
import AiExplainButton from '@/components/ui/AiExplainButton';
import type { QrScanResult, RiskLevel } from '@/types/scanner';

function riskVariant(level: RiskLevel): 'high' | 'medium' | 'low' {
  if (level === 'HIGH') return 'high';
  if (level === 'MEDIUM') return 'medium';
  return 'low';
}

function riskColor(level: RiskLevel): string {
  if (level === 'HIGH') return 'text-danger';
  if (level === 'MEDIUM') return 'text-warning';
  return 'text-success';
}

export default function QrScannerPage(): JSX.Element {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<QrScanResult | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>): void {
    const selected = e.target.files?.[0] ?? null;
    setFile(selected);
    setFileName(selected?.name ?? '');
    setResult(null);
  }

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    if (file === null) {
      toast.error('Please select an image file.');
      return;
    }
    setIsSubmitting(true);
    try {
      const data = await scanQr(file);
      setResult(data);
      toast.success('QR code scanned successfully.');
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  function reset(): void {
    setFile(null);
    setFileName('');
    setResult(null);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-text-primary">QR Scanner</h1>
        <p className="mt-0.5 text-sm text-text-muted">Decode and verify QR codes before following links</p>
      </div>

      <div className="flex max-w-2xl flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Scan a QR Code</CardTitle>
            <QrCode className="h-4 w-4 text-text-muted" />
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-bg-elevated py-10 hover:border-primary/40 transition-colors">
                <Upload className="h-7 w-7 text-text-muted" />
                {fileName.length > 0 ? (
                  <span className="text-sm text-text-primary">{fileName}</span>
                ) : (
                  <span className="text-sm text-text-muted">Click to upload a QR code image</span>
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/png,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>

              <Button
                type="submit"
                loading={isSubmitting}
                disabled={file === null}
                className="self-start"
              >
                Scan QR Code
              </Button>
            </form>
          </CardContent>
        </Card>

        {result !== null && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
          <Card>
            <CardHeader>
              <CardTitle>Scan Result</CardTitle>
              <div className="flex items-center gap-2">
                {result.scan !== null && (
                  <AiExplainButton scanId={result.scan.scanId} />
                )}
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={reset} title="Reset">
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <Badge variant={result.type === 'url' ? 'primary' : 'default'}>
                  {result.type.toUpperCase()}
                </Badge>
                <span className="text-xs text-text-muted">Decoded content</span>
              </div>

              <div className="rounded-lg border border-border bg-bg-elevated p-3">
                <p className="break-all text-xs text-text-secondary">{result.decoded}</p>
              </div>

              {result.scan !== null && (
                <div className="flex flex-col gap-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
                    URL Risk Analysis
                  </p>
                  <div className="flex items-center gap-3">
                    <span className={`text-3xl font-bold tabular-nums ${riskColor(result.scan.riskLevel)}`}>
                      {result.scan.riskScore}
                    </span>
                    <div className="flex flex-col gap-1">
                      <Badge variant={riskVariant(result.scan.riskLevel)}>
                        {result.scan.riskLevel}
                      </Badge>
                      <span className="text-xs text-text-muted">
                        Confidence {result.scan.confidence}%
                      </span>
                    </div>
                  </div>

                  {result.scan.reasons.length > 0 && (
                    <ul className="flex flex-col gap-1.5">
                      {result.scan.reasons.map((reason, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-text-secondary">
                          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-text-muted" />
                          {reason}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
