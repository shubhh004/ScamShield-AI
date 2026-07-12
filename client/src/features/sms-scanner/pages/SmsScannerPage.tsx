import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MessageSquare, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { scanSms } from '@/services/scanner.service';
import { getApiError } from '@/utils/apiError';
import AiExplainButton from '@/components/ui/AiExplainButton';
import type { SmsScanResult, RiskLevel } from '@/types/scanner';

const schema = z.object({
  message: z
    .string()
    .min(5, 'Message must be at least 5 characters')
    .max(1600, 'Message must be at most 1,600 characters'),
});

type FormValues = z.infer<typeof schema>;

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

export default function SmsScannerPage(): JSX.Element {
  const [result, setResult] = useState<SmsScanResult | null>(null);

  const {
    register,
    handleSubmit,
    reset: resetForm,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues): Promise<void> {
    try {
      const data = await scanSms(values.message);
      setResult(data);
      toast.success('SMS scan complete.');
    } catch (err) {
      toast.error(getApiError(err));
    }
  }

  function reset(): void {
    setResult(null);
    resetForm();
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-text-primary">SMS Scanner</h1>
        <p className="mt-0.5 text-sm text-text-muted">Detect smishing attempts and fraudulent texts</p>
      </div>

      <div className="flex max-w-2xl flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Scan an SMS</CardTitle>
            <MessageSquare className="h-4 w-4 text-text-muted" />
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-text-secondary">Message</label>
                <textarea
                  rows={5}
                  className="w-full resize-none rounded-lg border border-border bg-bg-card px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-primary/60 focus:outline-none focus:ring-1 focus:ring-primary/30"
                  placeholder="Paste the SMS text here…"
                  {...register('message')}
                />
                {errors.message?.message !== undefined && (
                  <p className="text-xs text-danger">{errors.message.message}</p>
                )}
              </div>

              <Button type="submit" loading={isSubmitting} className="self-start">
                Scan Message
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
                <AiExplainButton scanId={result.scanId} />
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={reset} title="Reset">
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <span className={`text-3xl font-bold tabular-nums ${riskColor(result.riskLevel)}`}>
                  {result.riskScore}
                </span>
                <div className="flex flex-col gap-1">
                  <Badge variant={riskVariant(result.riskLevel)}>{result.riskLevel}</Badge>
                  <span className="text-xs text-text-muted">Confidence {result.confidence}%</span>
                </div>
              </div>

              {result.reasons.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-text-muted">
                    Reasons
                  </p>
                  <ul className="flex flex-col gap-1.5">
                    {result.reasons.map((reason, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-text-secondary">
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-text-muted" />
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.urlsFound.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-text-muted">
                    URLs Found ({result.urlsFound.length})
                  </p>
                  <div className="flex flex-col gap-2">
                    {result.urlsFound.map((u, i) => (
                      <div key={i} className="rounded-lg border border-border bg-bg-elevated p-3">
                        <div className="flex items-center justify-between gap-2">
                          <p className="flex-1 break-all text-xs text-text-secondary">{u.url}</p>
                          <Badge variant={riskVariant(u.riskLevel)} className="shrink-0">
                            {u.riskScore}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.phoneNumbersFound.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-text-muted">
                    Phone Numbers ({result.phoneNumbersFound.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {result.phoneNumbersFound.map((phone, i) => (
                      <Badge key={i} variant="default">{phone}</Badge>
                    ))}
                  </div>
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
