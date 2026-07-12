import { useState } from 'react';
import { Image, Upload, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { scanImage } from '@/services/scanner.service';
import { getApiError } from '@/utils/apiError';
import type { ImageScanResult, RiskLevel } from '@/types/scanner';

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

function recommendationVariant(
  r: ImageScanResult['recommendation'],
): 'low' | 'medium' | 'high' {
  if (r === 'Potential Scam') return 'high';
  if (r === 'Review Carefully') return 'medium';
  return 'low';
}

export default function OcrScannerPage(): JSX.Element {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<ImageScanResult | null>(null);

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
      const data = await scanImage(file);
      setResult(data);
      toast.success('Image scanned successfully.');
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
        <h1 className="text-xl font-bold text-text-primary">Image OCR Scanner</h1>
        <p className="mt-0.5 text-sm text-text-muted">Extract and scan text from screenshots and images</p>
      </div>

      <div className="flex max-w-2xl flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Scan an Image</CardTitle>
            <Image className="h-4 w-4 text-text-muted" />
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-bg-elevated py-10 hover:border-primary/40 transition-colors">
                <Upload className="h-7 w-7 text-text-muted" />
                {fileName.length > 0 ? (
                  <span className="text-sm text-text-primary">{fileName}</span>
                ) : (
                  <span className="text-sm text-text-muted">Click to upload an image (PNG, JPG, WEBP)</span>
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
                Scan Image
              </Button>
            </form>
          </CardContent>
        </Card>

        {result !== null && (
          <Card>
            <CardHeader>
              <CardTitle>Scan Result</CardTitle>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={reset} title="Reset">
                <RotateCcw className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={recommendationVariant(result.recommendation)}>
                  {result.recommendation}
                </Badge>
                <div className="flex items-center gap-2">
                  <span className={`text-xl font-bold tabular-nums ${riskColor(result.overallRisk)}`}>
                    {result.overallRisk}
                  </span>
                  <span className="text-xs text-text-muted">
                    · Confidence {result.overallConfidence}%
                  </span>
                </div>
              </div>

              {result.ocr.extractedText.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-text-muted">
                    Extracted Text
                  </p>
                  <pre className="max-h-40 overflow-y-auto whitespace-pre-wrap break-words rounded-lg border border-border bg-bg-elevated p-3 text-xs text-text-secondary">
                    {result.ocr.extractedText}
                  </pre>
                </div>
              )}

              {result.urlScan !== null && (
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-text-muted">
                    URL Risk Analysis
                  </p>
                  <div className="flex items-center gap-3 rounded-lg border border-border bg-bg-elevated p-3">
                    <span className={`text-2xl font-bold tabular-nums ${riskColor(result.urlScan.riskLevel)}`}>
                      {result.urlScan.riskScore}
                    </span>
                    <div className="flex flex-col gap-1">
                      <Badge variant={riskVariant(result.urlScan.riskLevel)}>
                        {result.urlScan.riskLevel}
                      </Badge>
                      <p className="break-all text-xs text-text-muted">{result.urlScan.url}</p>
                    </div>
                  </div>
                </div>
              )}

              {result.smsScan !== null && (
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-text-muted">
                    SMS Risk Analysis
                  </p>
                  <div className="flex items-center gap-3 rounded-lg border border-border bg-bg-elevated p-3">
                    <span className={`text-2xl font-bold tabular-nums ${riskColor(result.smsScan.riskLevel)}`}>
                      {result.smsScan.riskScore}
                    </span>
                    <Badge variant={riskVariant(result.smsScan.riskLevel)}>
                      {result.smsScan.riskLevel}
                    </Badge>
                  </div>
                </div>
              )}

              {(result.ocr.urlsFound.length > 0 ||
                result.ocr.emailsFound.length > 0 ||
                result.ocr.phoneNumbersFound.length > 0 ||
                result.ocr.otpFound.length > 0) && (
                <div className="flex flex-col gap-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
                    Extracted Items
                  </p>

                  {result.ocr.urlsFound.length > 0 && (
                    <div>
                      <p className="mb-1.5 text-xs text-text-muted">
                        URLs ({result.ocr.urlsFound.length})
                      </p>
                      <div className="flex flex-col gap-1">
                        {result.ocr.urlsFound.map((u, i) => (
                          <p key={i} className="break-all text-xs text-text-secondary">{u}</p>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.ocr.emailsFound.length > 0 && (
                    <div>
                      <p className="mb-1.5 text-xs text-text-muted">
                        Emails ({result.ocr.emailsFound.length})
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {result.ocr.emailsFound.map((email, i) => (
                          <Badge key={i} variant="default">{email}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.ocr.phoneNumbersFound.length > 0 && (
                    <div>
                      <p className="mb-1.5 text-xs text-text-muted">
                        Phone Numbers ({result.ocr.phoneNumbersFound.length})
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {result.ocr.phoneNumbersFound.map((phone, i) => (
                          <Badge key={i} variant="default">{phone}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.ocr.otpFound.length > 0 && (
                    <div>
                      <p className="mb-1.5 text-xs text-text-muted">
                        OTPs / Codes ({result.ocr.otpFound.length})
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {result.ocr.otpFound.map((otp, i) => (
                          <Badge key={i} variant="warning">{otp}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
