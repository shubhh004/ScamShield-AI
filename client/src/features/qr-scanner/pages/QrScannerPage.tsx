import { useState } from 'react';
import { QrCode, Upload, RotateCcw, ShieldAlert, FileImage } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { cn } from '@/utils/cn';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { scanQr } from '@/services/scanner.service';
import { getApiError } from '@/utils/apiError';
import AiExplainButton from '@/components/ui/AiExplainButton';
import type { QrScanResult, RiskLevel } from '@/types/scanner';

const EASE = [0.16, 1, 0.3, 1] as const;

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

function riskBg(level: RiskLevel): string {
  if (level === 'HIGH') return 'bg-danger/10 border-danger/20';
  if (level === 'MEDIUM') return 'bg-warning/10 border-warning/20';
  return 'bg-success/10 border-success/20';
}

export default function QrScannerPage(): JSX.Element {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<QrScanResult | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>): void {
    const selected = e.target.files?.[0] ?? null;
    setFile(selected);
    setFileName(selected?.name ?? '');
    setResult(null);
  }

  function handleDrop(e: React.DragEvent<HTMLLabelElement>): void {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped !== undefined) {
      setFile(dropped);
      setFileName(dropped.name);
      setResult(null);
    }
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
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE }}
      >
        <h1 className="text-xl font-bold text-text-primary">QR Scanner</h1>
        <p className="mt-0.5 text-sm text-text-muted">Decode and verify QR codes before following links</p>
      </motion.div>

      <div className="flex max-w-2xl flex-col gap-4">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05, ease: EASE }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Scan a QR Code</CardTitle>
              <QrCode className="h-4 w-4 text-text-muted" />
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <label
                  className={cn(
                    'flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-10 transition-all duration-200',
                    isDragging
                      ? 'scale-[1.01] border-primary/60 bg-primary/5'
                      : fileName.length > 0
                      ? 'border-primary/40 bg-primary/5'
                      : 'border-border bg-bg-elevated hover:border-primary/40 hover:bg-primary/[0.03]',
                  )}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
                  onDrop={handleDrop}
                >
                  {fileName.length > 0 ? (
                    <>
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20">
                        <FileImage className="h-5 w-5 text-primary" />
                      </div>
                      <span className="text-sm font-medium text-text-primary">{fileName}</span>
                      <span className="text-xs text-text-muted">Click to change file</span>
                    </>
                  ) : (
                    <>
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-bg-card border border-border">
                        <Upload className="h-5 w-5 text-text-muted" />
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-sm font-medium text-text-secondary">
                          Drop QR code image here
                        </span>
                        <span className="text-xs text-text-muted">or click to browse · JPEG, PNG</span>
                      </div>
                    </>
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
        </motion.div>

        <AnimatePresence mode="wait">
          {result !== null && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 16, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.99 }}
              transition={{ duration: 0.35, ease: EASE }}
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
                <CardContent className="flex flex-col gap-5">
                  <div className="flex items-center gap-2">
                    <Badge variant={result.type === 'url' ? 'primary' : 'default'}>
                      {result.type.toUpperCase()}
                    </Badge>
                    <span className="text-xs text-text-muted">Decoded content</span>
                  </div>

                  <div className="rounded-lg border border-border bg-bg-elevated px-3 py-2.5">
                    <p className="break-all text-xs text-text-secondary">{result.decoded}</p>
                  </div>

                  {result.scan !== null && (
                    <div className="flex flex-col gap-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
                        URL Risk Analysis
                      </p>
                      <div className={`flex items-center gap-4 rounded-xl border p-4 ${riskBg(result.scan.riskLevel)}`}>
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-bg-elevated">
                          <ShieldAlert className={`h-6 w-6 ${riskColor(result.scan.riskLevel)}`} />
                        </div>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-3xl font-bold tabular-nums leading-none ${riskColor(result.scan.riskLevel)}`}>
                              {result.scan.riskScore}
                            </span>
                            <Badge variant={riskVariant(result.scan.riskLevel)}>
                              {result.scan.riskLevel}
                            </Badge>
                          </div>
                          <span className="text-xs text-text-muted">Confidence {result.scan.confidence}%</span>
                        </div>
                      </div>

                      {result.scan.reasons.length > 0 && (
                        <ul className="flex flex-col gap-1.5">
                          {result.scan.reasons.map((reason, i) => (
                            <motion.li
                              key={i}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.25, delay: 0.08 + i * 0.05, ease: 'easeOut' }}
                              className="flex items-center gap-2.5 text-xs text-text-secondary"
                            >
                              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-danger/60" />
                              {reason}
                            </motion.li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
