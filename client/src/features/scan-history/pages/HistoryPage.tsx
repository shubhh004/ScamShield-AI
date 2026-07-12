import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { History, Trash2, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { cn } from '@/utils/cn';
import { getApiError } from '@/utils/apiError';
import * as historyService from '@/services/history.service';
import type { HistoryEntry, ScanType, RiskFilter, HistoryQueryParams } from '@/types/history';

const LIMIT = 10;

const TYPE_FILTERS: Array<{ label: string; value: ScanType | null }> = [
  { label: 'All', value: null },
  { label: 'URL', value: 'url' },
  { label: 'Email', value: 'email' },
  { label: 'SMS', value: 'sms' },
  { label: 'QR', value: 'qr' },
  { label: 'OCR', value: 'ocr' },
];

const RISK_FILTERS: Array<{ label: string; value: RiskFilter | null }> = [
  { label: 'All', value: null },
  { label: 'HIGH', value: 'HIGH' },
  { label: 'MEDIUM', value: 'MEDIUM' },
  { label: 'LOW', value: 'LOW' },
];

function riskVariant(score: number): 'high' | 'medium' | 'low' {
  if (score >= 50) return 'high';
  if (score >= 21) return 'medium';
  return 'low';
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const date = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  return `${date} · ${time}`;
}

function truncate(str: string, max: number): string {
  return str.length > max ? `${str.slice(0, max)}…` : str;
}

function riskFilterClass(value: RiskFilter | null, active: boolean): string {
  if (!active) return 'border-border bg-bg-elevated text-text-muted hover:text-text-secondary';
  if (value === 'HIGH') return 'border-danger/60 bg-danger/10 text-danger';
  if (value === 'MEDIUM') return 'border-warning/60 bg-warning/10 text-warning';
  if (value === 'LOW') return 'border-success/60 bg-success/10 text-success';
  return 'border-primary/60 bg-primary/10 text-primary';
}

export default function HistoryPage(): JSX.Element {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState<ScanType | null>(null);
  const [riskFilter, setRiskFilter] = useState<RiskFilter | null>(null);
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<HistoryEntry | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const load = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const params: HistoryQueryParams = { page, limit: LIMIT };
      if (typeFilter !== null) params.type = typeFilter;
      if (riskFilter !== null) params.risk = riskFilter;
      const { entries: items, pagination } = await historyService.listHistory(params);
      setEntries(items);
      setTotalPages(pagination.totalPages);
      setTotalItems(pagination.total);
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setIsLoading(false);
    }
  }, [page, typeFilter, riskFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  const displayedEntries = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (term.length === 0) return entries;
    return entries.filter((e) => e.input.toLowerCase().includes(term));
  }, [entries, search]);

  function handleTypeFilter(value: ScanType | null): void {
    setTypeFilter(value);
    setPage(1);
  }

  function handleRiskFilter(value: RiskFilter | null): void {
    setRiskFilter(value);
    setPage(1);
  }

  function clearFilters(): void {
    setTypeFilter(null);
    setRiskFilter(null);
    setSearch('');
    setPage(1);
  }

  async function handleDeleteConfirm(): Promise<void> {
    if (deleteTarget === null) return;
    setIsDeleting(true);
    try {
      await historyService.deleteHistoryEntry(deleteTarget._id);
      toast.success('Entry deleted.');
      setDeleteTarget(null);
      if (entries.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        void load();
      }
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setIsDeleting(false);
    }
  }

  const hasFilters = typeFilter !== null || riskFilter !== null || search.trim().length > 0;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-text-primary">Scan History</h1>
        <p className="mt-0.5 text-sm text-text-muted">All your previous scans</p>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-3">
        <div className="max-w-md">
          <Input
            placeholder="Search by URL, email, message…"
            leftIcon={<Search className="h-4 w-4" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {TYPE_FILTERS.map(({ label, value }) => (
            <button
              key={label}
              type="button"
              onClick={() => handleTypeFilter(value)}
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                typeFilter === value
                  ? 'border-primary/60 bg-primary/10 text-primary'
                  : 'border-border bg-bg-elevated text-text-muted hover:text-text-secondary',
              )}
            >
              {label}
            </button>
          ))}
          <div className="mx-1 h-4 w-px bg-border" />
          {RISK_FILTERS.map(({ label, value }) => (
            <button
              key={label}
              type="button"
              onClick={() => handleRiskFilter(value)}
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                riskFilterClass(value, riskFilter === value),
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 6 }, (_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-lg border border-border/50 bg-bg-card p-4"
            >
              <div className="flex items-center gap-3">
                <div className="h-5 w-14 rounded-full bg-bg-elevated" />
                <div className="h-5 w-12 rounded-full bg-bg-elevated" />
                <div className="h-4 flex-1 rounded bg-bg-elevated" />
                <div className="h-4 w-32 rounded bg-bg-elevated" />
                <div className="h-7 w-7 rounded-lg bg-bg-elevated" />
              </div>
            </div>
          ))}
        </div>
      ) : error !== null ? (
        <Card>
          <CardContent>
            <EmptyState
              title="Failed to load history"
              description={error}
              action={
                <Button variant="secondary" size="sm" onClick={() => { void load(); }}>
                  Retry
                </Button>
              }
            />
          </CardContent>
        </Card>
      ) : displayedEntries.length === 0 ? (
        <Card>
          <CardContent>
            {hasFilters ? (
              <EmptyState
                title="No results found"
                description="Try adjusting your filters or search term."
                action={
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear filters
                  </Button>
                }
              />
            ) : (
              <EmptyState
                icon={<History className="h-7 w-7" />}
                title="No scan history"
                description="Your completed scans will appear here."
              />
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          {displayedEntries.map((entry, i) => (
            <motion.div
              key={entry._id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18, delay: i * 0.04 }}
              className="group glass rounded-lg border border-border/50 p-4 transition-colors hover:border-border"
            >
              <div className="flex items-center gap-3">
                <Badge variant="default" className="shrink-0 text-[10px] uppercase">
                  {entry.scanType}
                </Badge>
                <Badge variant={riskVariant(entry.riskScore)} className="shrink-0 tabular-nums">
                  {entry.riskScore}
                </Badge>
                <p className="flex-1 truncate text-xs text-text-secondary">
                  {truncate(entry.input, 64)}
                </p>
                <span className="hidden shrink-0 text-xs text-text-muted lg:block">
                  {formatDate(entry.createdAt)}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 shrink-0 p-0 opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={() => setDeleteTarget(entry)}
                  title="Delete entry"
                >
                  <Trash2 className="h-3.5 w-3.5 text-danger" />
                </Button>
              </div>
              <p className="mt-1.5 text-xs text-text-muted lg:hidden">
                {formatDate(entry.createdAt)}
              </p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && !isLoading && error === null && (
        <div className="flex items-center justify-between border-t border-border pt-4">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
            Prev
          </Button>
          <span className="text-xs text-text-muted">
            Page {page} of {totalPages} · {totalItems} total
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Delete confirmation */}
      <Modal
        open={deleteTarget !== null}
        onClose={() => { if (!isDeleting) setDeleteTarget(null); }}
        title="Delete entry"
        size="sm"
      >
        <p className="text-sm text-text-secondary">
          This will permanently remove this scan entry. This cannot be undone.
        </p>
        {deleteTarget !== null && (
          <div className="mt-3 rounded-lg border border-border bg-bg-elevated px-3 py-2">
            <div className="flex items-center gap-2">
              <Badge variant="default" className="shrink-0 text-[10px] uppercase">
                {deleteTarget.scanType}
              </Badge>
              <p className="truncate text-xs text-text-muted">
                {truncate(deleteTarget.input, 55)}
              </p>
            </div>
          </div>
        )}
        <div className="mt-5 flex justify-end gap-2">
          <Button
            variant="secondary"
            size="sm"
            disabled={isDeleting}
            onClick={() => setDeleteTarget(null)}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            loading={isDeleting}
            onClick={() => { void handleDeleteConfirm(); }}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
