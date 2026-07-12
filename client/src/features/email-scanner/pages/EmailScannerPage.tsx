import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { scanEmail } from '@/services/scanner.service';
import { getApiError } from '@/utils/apiError';
import type { ScanEmailResult, RiskLevel } from '@/types/scanner';

const schema = z.object({
  sender: z.string().email('Enter a valid sender email'),
  subject: z.string().max(998, 'Subject is too long'),
  body: z
    .string()
    .min(1, 'Email body is required')
    .max(10000, 'Body must be at most 10,000 characters'),
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

export default function EmailScannerPage(): JSX.Element {
  const [result, setResult] = useState<ScanEmailResult | null>(null);

  const {
    register,
    handleSubmit,
    reset: resetForm,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues): Promise<void> {
    try {
      const data = await scanEmail({
        sender: values.sender,
        subject: values.subject,
        body: values.body,
      });
      setResult(data);
      toast.success('Email scan complete.');
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
        <h1 className="text-xl font-bold text-text-primary">Email Scanner</h1>
        <p className="mt-0.5 text-sm text-text-muted">Analyse emails for phishing and social engineering</p>
      </div>

      <div className="flex max-w-2xl flex-col gap-4">
        <Card>
          <CardHeader><CardTitle>Scan an Email</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
              <Input
                label="Sender"
                type="email"
                placeholder="sender@example.com"
                leftIcon={<Mail className="h-4 w-4" />}
                error={errors.sender?.message}
                {...register('sender')}
              />

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-text-secondary">Subject</label>
                <input
                  className="w-full rounded-lg border border-border bg-bg-card px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-primary/60 focus:outline-none focus:ring-1 focus:ring-primary/30"
                  placeholder="Email subject"
                  {...register('subject')}
                />
                {errors.subject?.message !== undefined && (
                  <p className="text-xs text-danger">{errors.subject.message}</p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-text-secondary">Body</label>
                <textarea
                  rows={6}
                  className="w-full resize-none rounded-lg border border-border bg-bg-card px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-primary/60 focus:outline-none focus:ring-1 focus:ring-primary/30"
                  placeholder="Paste email body here…"
                  {...register('body')}
                />
                {errors.body?.message !== undefined && (
                  <p className="text-xs text-danger">{errors.body.message}</p>
                )}
              </div>

              <Button type="submit" loading={isSubmitting} className="self-start">
                Scan Email
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
              <div className="flex items-center gap-3">
                <span className={`text-3xl font-bold tabular-nums ${riskColor(result.riskLevel)}`}>
                  {result.riskScore}
                </span>
                <Badge variant={riskVariant(result.riskLevel)}>{result.riskLevel}</Badge>
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
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
