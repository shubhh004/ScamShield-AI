import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  History,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  Link2,
  Mail,
  MessageSquare,
  QrCode,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import AiExplainButton from '@/components/ui/AiExplainButton';
import { cn } from '@/utils/cn';
import { getApiError } from '@/utils/apiError';
import { ROUTES } from '@/constants/routes';
import * as historyService from '@/services/history.service';
import type { HistoryEntry, ScanType, RiskFilter, HistoryQueryParams } from '@/types/history';

// ── Constants ─────────────────────────────────────────────────────────────────

const LIMIT = 10;

type SortMode = 'newest' | 'oldest' | 'highest' | 'lowest';

const TYPE_FILTERS: Array<{ label: string; value: ScanType | null }> = [
  { label: 'All', value: null },
  { label: 'URL', value: 'url' },
  { label: 'Email', value: 'email' },
  { label: 'SMS', value: 'sms' },
  { label: 'QR', value: 'qr' },
  { label: 'OCR', value: 'ocr' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function ScanTypeIcon({ type }: { type: ScanType }): JSX.Element {
  if (type === 'url') return <Link2 className="h-4 w-4" />;
  if (type === 'email') return <Mail className="h-4 w-4" />;
  if (type === 'sms') return <MessageSquare className="h-4 w-4" />;
  if (type === 'qr') return <QrCode className="h-4 w-4" />;
  return <ImageIcon className="h-4 w-4" />;
}

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

function toStringArray(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((r): r is string => typeof r === 'string') : [];
}

function extractReasons(result: Record<string, unknown>): string[] {
  const direct = toStringArray(result['reasons']);
  if (direct.length > 0) return direct;

  const scan = result['scan'];
  if (scan !== null && typeof scan === 'object') {
    const qr = toStringArray((scan as Record<string, unknown>)['reasons']);
    if (qr.length > 0) return qr;
  }

  for (const key of ['urlScan', 'smsScan', 'emailScan'] as const) {
    const sub = result[key];
    if (sub !== null && typeof sub === 'object') {
      const sr = toStringArray((sub as Record<string, unknown>)['reasons']);
      if (sr.length > 0) return sr;
    }
  }

  return [];
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function SkeletonCard(): JSX.Element {
  return (
    <div className="animate-pulse rounded-xl border border-border/50 bg-bg-card p-5">
      <div className="flex items-start gap-3">
        <div className="h-9 w-9 shrink-0 rounded-lg bg-bg-elevated" />
        <div className="flex flex-1 flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="h-4 w-12 rounded-full bg-bg-elevated" />
            <div className="h-4 w-10 rounded-full bg-bg-elevated" />
            <div className="h-3 w-20 rounded bg-bg-elevated" />
          </div>
          <div className="h-3 w-3/4 rounded bg-bg-elevated" />
          <div className="flex gap-1.5">
            <div className="h-5 w-28 rounded-md bg-bg-elevated" />
            <div className="h-5 w-20 rounded-md bg-bg-elevated" />
          </div>
          <div className="flex gap-2">
            <div className="h-8 w-28 rounded-lg bg-bg-elevated" />
            <div className="h-8 w-20 rounded-lg bg-bg-elevated" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Select styles ─────────────────────────────────────────────────────────────

const SELECT_CLS =
  'h-8 rounded-lg border border-border bg-bg-elevated px-2.5 text-xs text-text-primary ' +
  'focus:border-primary/60 focus:outline-none focus:ring-1 focus:ring-primary/30 cursor-pointer';

// ── Main page ─────────────────────────────────────────────────────────────────

export default function HistoryPage(): JSX.Element {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState<ScanType | null>(null);
  const [riskFilter, setRiskFilter] = useState<RiskFilter | null>(null);
  const [sortMode, setSortMode] = useState<SortMode>('newest');
  const [search, setSearch] = useState('');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [deleteTarget, setDeleteTarget] = useState<HistoryEntry | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const serverSort = sortMode === 'oldest' ? ('asc' as const) : ('desc' as const);

  const load = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const params: HistoryQueryParams = { page, limit: LIMIT };
      if (typeFilter !== null) params.type = typeFilter;
      if (riskFilter !== null) params.risk = riskFilter;
      params.sort = serverSort;
      const { entries: items, pagination } = await historyService.listHistory(params);
      setEntries(items);
      setTotalPages(pagination.totalPages);
      setTotalItems(pagination.total);
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setIsLoading(false);
    }
  }, [page, typeFilter, riskFilter, serverSort]);

  useEffect(() => {
    void load();
  }, [load]);

  const displayedEntries = useMemo(() => {
    let items = entries;
    const term = search.trim().toLowerCase();
    if (term.length > 0) {
      items = items.filter((e) => e.input.toLowerCase().includes(term));
    }
    if (sortMode === 'highest') {
      items = [...items].sort((a, b) => b.riskScore - a.riskScore);
    } else if (sortMode === 'lowest') {
      items = [...items].sort((a, b) => a.riskScore - b.riskScore);
    }
    return items;
  }, [entries, search, sortMode]);

  function handleTypeFilter(value: ScanType | null): void {
    setTypeFilter(value);
    setPage(1);
  }

  function handleRiskFilter(value: RiskFilter | null): void {
    setRiskFilter(value);
    setPage(1);
  }

  function handleSortChange(value: SortMode): void {
    setSortMode(value);
    setPage(1);
  }

  function toggleExpand(id: string): void {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function clearFilters(): void {
    setTypeFilter(null);
    setRiskFilter(null);
    setSortMode('newest');
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
      setExpandedIds((prev) => {
        const next = new Set(prev);
        next.delete(deleteTarget._id);
        return next;
      });
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

  const hasFilters =
    typeFilter !== null ||
    riskFilter !== null ||
    sortMode !== 'newest' ||
    search.trim().length > 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-text-primary">Scan History</h1>
        <p className="mt-0.5 text-sm text-text-muted">All your previous scans</p>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-3">
        {/* Search */}
        <div className="max-w-sm">
          <Input
            placeholder="Search by URL, email, message…"
            leftIcon={<Search className="h-4 w-4" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Filter row */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Type chips */}
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

          {/* Risk dropdown */}
          <select
            value={riskFilter ?? ''}
            onChange={(e) => {
              const val = e.target.value;
              handleRiskFilter(val.length === 0 ? null : (val as RiskFilter));
            }}
            className={SELECT_CLS}
            aria-label="Filter by risk"
          >
            <option value="">All Risks</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          {/* Sort dropdown */}
          <select
            value={sortMode}
            onChange={(e) => {
              handleSortChange(e.target.value as SortMode);
            }}
            className={SELECT_CLS}
            aria-label="Sort order"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="highest">Highest Risk</option>
            <option value="lowest">Lowest Risk</option>
          </select>

          {/* Clear filters */}
          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="rounded-full border border-border bg-bg-elevated px-3 py-1 text-xs font-medium text-text-muted transition-colors hover:text-text-secondary"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }, (_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : error !== null ? (
        <Card>
          <CardContent>
            <EmptyState
              icon={<AlertTriangle className="h-7 w-7" />}
              title="Failed to load history"
              description={error}
              action={
                <Button variant="secondary" size="sm" onClick={() => { void load(); }}>
                  <RefreshCw className="h-3.5 w-3.5" />
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
                icon={<History className="h-8 w-8" />}
                title="No scans yet"
                description="Your completed scans will appear here."
                action={
                  <Link to={ROUTES.SCAN_URL}>
                    <Button size="sm">Start Scanning</Button>
                  </Link>
                }
              />
            )}
          </CardContent>
        </Card>
      ) : (
        <motion.div
          key={`${typeFilter ?? ''}-${riskFilter ?? ''}-${sortMode}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.15 }}
          className="flex flex-col gap-3"
        >
          {displayedEntries.map((entry, i) => {
            const reasons = extractReasons(entry.result);
            const isExpanded = expandedIds.has(entry._id);

            return (
              <motion.div
                key={entry._id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18, delay: i * 0.03 }}
                className="group glass rounded-xl border border-border/50 p-5 transition-colors hover:border-border"
              >
                {/* Card header row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    {/* Type icon */}
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <ScanTypeIcon type={entry.scanType} />
                    </div>

                    {/* Info */}
                    <div className="flex min-w-0 flex-col gap-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
                          {entry.scanType}
                        </span>
                        <Badge variant={riskVariant(entry.riskScore)} className="tabular-nums">
                          {entry.riskScore}
                        </Badge>
                        <span className="text-xs text-text-muted">
                          · {entry.confidence}% confidence
                        </span>
                      </div>
                      <p className="truncate text-xs text-text-secondary">
                        {truncate(entry.input, 80)}
                      </p>
                      <p className="text-[11px] text-text-muted lg:hidden">
                        {formatDate(entry.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Date + delete */}
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="hidden text-xs text-text-muted lg:block">
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
                </div>

                {/* Threat reason chips */}
                {reasons.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5 pl-12">
                    {reasons.slice(0, 2).map((r, j) => (
                      <span
                        key={j}
                        className="rounded-md border border-border bg-bg-elevated px-2 py-0.5 text-[10px] text-text-muted"
                      >
                        {truncate(r, 48)}
                      </span>
                    ))}
                    {reasons.length > 2 && (
                      <span className="rounded-md border border-border bg-bg-elevated px-2 py-0.5 text-[10px] text-text-muted">
                        +{reasons.length - 2} more
                      </span>
                    )}
                  </div>
                )}

                {/* Action buttons */}
                <div className="mt-3 flex items-center gap-2 pl-12">
                  <AiExplainButton scanId={entry._id} />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleExpand(entry._id)}
                  >
                    {isExpanded ? (
                      <>
                        Less
                        <ChevronUp className="h-3.5 w-3.5" />
                      </>
                    ) : (
                      <>
                        Details
                        <ChevronDown className="h-3.5 w-3.5" />
                      </>
                    )}
                  </Button>
                </div>

                {/* Expandable details */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      key="details"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-3 flex flex-col gap-3 rounded-lg border border-border bg-bg-elevated p-3 pl-3 ml-12">
                        {entry.input.length > 80 && (
                          <div>
                            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-text-muted">
                              Full Input
                            </p>
                            <p className="break-all text-xs text-text-secondary">{entry.input}</p>
                          </div>
                        )}
                        {reasons.length > 0 && (
                          <div>
                            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-text-muted">
                              Threat Indicators
                            </p>
                            <ul className="flex flex-col gap-1.5">
                              {reasons.map((r, j) => (
                                <li
                                  key={j}
                                  className="flex items-start gap-2 text-xs text-text-secondary"
                                >
                                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-text-muted" />
                                  {r}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {reasons.length === 0 && entry.input.length <= 80 && (
                          <p className="text-xs text-text-muted">No additional details available.</p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </motion.div>
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

      {/* Delete modal */}
      <Modal
        open={deleteTarget !== null}
        onClose={() => {
          if (!isDeleting) setDeleteTarget(null);
        }}
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
            onClick={() => {
              void handleDeleteConfirm();
            }}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
