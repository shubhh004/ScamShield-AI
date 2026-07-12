import { useState } from 'react';
import { Cpu, CheckCircle2 } from 'lucide-react';
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
          <div className="flex items-center justify-center py-10">
            <div className="flex flex-col items-center gap-3">
              <Spinner />
              <p className="text-xs text-text-muted">Analysing with AI…</p>
            </div>
          </div>
        ) : result !== null ? (
          <div className="flex flex-col gap-5">
            <p className="text-sm leading-relaxed text-text-secondary">{result.answer}</p>

            {result.tips.length > 0 && (
              <div>
                <p className="mb-3 text-xs font-medium uppercase tracking-wide text-text-muted">
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

            <p className="text-[10px] text-text-muted">
              Powered by {result.provider} · {result.model}
            </p>
          </div>
        ) : null}
      </Modal>
    </>
  );
}
