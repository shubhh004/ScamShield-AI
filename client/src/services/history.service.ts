import apiClient from '@/lib/api/apiClient';
import type { HistoryEntry, PaginationMeta, HistoryQueryParams } from '@/types/history';

interface ListHistoryResponse {
  success: true;
  pagination: PaginationMeta;
  history: HistoryEntry[];
}

export async function listHistory(
  params: HistoryQueryParams,
): Promise<{ entries: HistoryEntry[]; pagination: PaginationMeta }> {
  const res = await apiClient.get<ListHistoryResponse>('/history', { params });
  return { entries: res.data.history, pagination: res.data.pagination };
}

export async function deleteHistoryEntry(id: string): Promise<void> {
  await apiClient.delete(`/history/${id}`);
}
