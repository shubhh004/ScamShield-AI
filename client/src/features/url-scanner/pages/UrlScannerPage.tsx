import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link2, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { scanUrl } from '@/services/scanner.service';
import { getApiError } from '@/utils/apiError';
import AiExplainButton from '@/components/ui/AiExplainButton';
import type { ScanUrlResult, RiskLevel } from '@/types/scanner';

const schema = z.object({
  url: z
    .string()
    .min(1, 'URL is required')
    .url('Must be a valid URL')
    .refine(
      (v) => v.startsWith('http://') || v.startsWith('https://'),
      'URL must use http or https',
    ),
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

export default function UrlScannerPage(): JSX.Element {
  const [result, setResult] = useState<ScanUrlResult | null>(null);

  const {
    register,
    handleSubmit,
    reset: resetForm,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues): Promise<void> {
    try {
      const data = await scanUrl(values.url);
      setResult(data);
      toast.success('URL scan complete.');
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
        <h1 className="text-xl font-bold text-text-primary">URL Scanner</h1>
        <p className="mt-0.5 text-sm text-text-muted">Detect phishing links and malicious domains</p>
      </div>

      <div className="flex max-w-2xl flex-col gap-4">
        <Card>
          <CardHeader><CardTitle>Scan a URL</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
              <Input
                label="URL"
                type="url"
                placeholder="https://example.com"
                leftIcon={<Link2 className="h-4 w-4" />}
                error={errors.url?.message}
                {...register('url')}
              />
              <Button type="submit" loading={isSubmitting} className="self-start">
                Scan URL
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

              <div className="flex flex-col gap-1">
                <p className="text-xs text-text-muted">Scanned URL</p>
                <p className="break-all text-xs text-text-secondary">{result.normalizedUrl}</p>
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
            </CardContent>
          </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
