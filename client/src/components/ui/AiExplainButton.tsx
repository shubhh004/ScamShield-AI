import { useState } from 'react';
import { Cpu, CheckCircle2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import Modal from './Modal';
import Button from './Button';
import { Spinner } from './Loading';
import { explainScan } from '@/services/ai.service';
import { getApiError } from '@/utils/apiError';
import type { AIResponse } from '@/types/ai';

interface AiExplainButtonProps {
  scanId: string;
}

export default function AiExplainButton({ scanId }: AiExplainButtonProps): JSX.Element {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AIResponse | null>(null);

  async function handleOpen(): Promise<void> {
    if (result !== null) {
      setOpen(true);
      return;
    }
    setOpen(true);
    setIsLoading(true);
    try {
      const data = await explainScan(scanId);
      setResult(data);
    } catch (err) {
      toast.error(getApiError(err));
      setOpen(false);
    } finally {
      setIsLoading(false);
    }
  }

  function handleClose(): void {
    if (isLoading) return;
    setOpen(false);
  }

  return (
    <>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => {
          void handleOpen();
        }}
      >
        <Cpu className="h-3.5 w-3.5" />
        Explain with AI
      </Button>

      <Modal open={open} onClose={handleClose} title="AI Explanation" size="lg">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-4 py-12">
            <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Cpu className="h-5 w-5 text-primary" />
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-bg-card">
                <Spinner size="sm" className="h-3 w-3" />
              </span>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-text-primary">Analysing with AI</p>
              <p className="mt-0.5 text-xs text-text-muted">This usually takes a few seconds…</p>
            </div>
          </div>
        ) : result !== null ? (
          <div className="flex flex-col gap-5">
            <div className="rounded-xl border border-primary/15 bg-primary/5 p-4">
              <div className="mb-2.5 flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-semibold text-primary">Analysis</span>
              </div>
              <p className="text-sm leading-relaxed text-text-secondary">{result.answer}</p>
            </div>

            {result.tips.length > 0 && (
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
                  Safety Tips
                </p>
                <ul className="flex flex-col gap-2.5">
                  {result.tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs text-text-secondary">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <p className="border-t border-border pt-3 text-[10px] text-text-muted">
              Powered by {result.provider} · {result.model}
            </p>
          </div>
        ) : null}
      </Modal>
    </>
  );
}
