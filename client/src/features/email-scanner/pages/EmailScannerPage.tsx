import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, RotateCcw, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { scanEmail } from '@/services/scanner.service';
import { getApiError } from '@/utils/apiError';
import AiExplainButton from '@/components/ui/AiExplainButton';
import type { ScanEmailResult, RiskLevel } from '@/types/scanner';

const EASE = [0.16, 1, 0.3, 1] as const;

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

function riskBg(level: RiskLevel): string {
  if (level === 'HIGH') return 'bg-danger/10 border-danger/20';
  if (level === 'MEDIUM') return 'bg-warning/10 border-warning/20';
  return 'bg-success/10 border-success/20';
}

const textareaBase = 'input-textarea';

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
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE }}
      >
        <h1 className="text-xl font-bold text-text-primary">Email Scanner</h1>
        <p className="mt-0.5 text-sm text-text-muted">Analyse emails for phishing and social engineering</p>
      </motion.div>

      <div className="flex max-w-2xl flex-col gap-4">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05, ease: EASE }}
        >
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
                  <label htmlFor="email-subject" className="text-sm font-medium text-text-secondary">Subject</label>
                  <input
                    id="email-subject"
                    className={textareaBase}
                    placeholder="Email subject"
                    {...register('subject')}
                  />
                  {errors.subject?.message !== undefined && (
                    <p className="text-xs text-danger">{errors.subject.message}</p>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="email-body" className="text-sm font-medium text-text-secondary">Body</label>
                  <textarea
                    id="email-body"
                    rows={6}
                    className={textareaBase}
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
                    <AiExplainButton scanId={result.scanId} />
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={reset} title="Reset">
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-5">
                  {/* Risk score hero */}
                  <div className={`flex items-center gap-4 rounded-xl border p-4 ${riskBg(result.riskLevel)}`}>
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-bg-elevated">
                      <ShieldAlert className={`h-6 w-6 ${riskColor(result.riskLevel)}`} />
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-3xl font-bold tabular-nums leading-none ${riskColor(result.riskLevel)}`}>
                          {result.riskScore}
                        </span>
                        <Badge variant={riskVariant(result.riskLevel)}>{result.riskLevel}</Badge>
                      </div>
                    </div>
                  </div>

                  {result.reasons.length > 0 && (
                    <div>
                      <p className="mb-2.5 text-xs font-medium uppercase tracking-wide text-text-muted">
                        Risk Factors
                      </p>
                      <ul className="flex flex-col gap-1.5">
                        {result.reasons.map((reason, i) => (
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
                    </div>
                  )}

                  {result.urlsFound.length > 0 && (
                    <div>
                      <p className="mb-2.5 text-xs font-medium uppercase tracking-wide text-text-muted">
                        URLs Found ({result.urlsFound.length})
                      </p>
                      <div className="flex flex-col gap-2">
                        {result.urlsFound.map((u, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.25, delay: 0.1 + i * 0.06, ease: 'easeOut' }}
                            className="rounded-lg border border-border bg-bg-elevated p-3"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <p className="flex-1 break-all text-xs text-text-secondary">{u.url}</p>
                              <Badge variant={riskVariant(u.riskLevel)} className="shrink-0">
                                {u.riskScore}
                              </Badge>
                            </div>
                          </motion.div>
                        ))}
                      </div>
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
