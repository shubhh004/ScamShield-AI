import apiClient from '@/lib/api/apiClient';
import type { AIResponse } from '@/types/ai';

type ApiWrap<T> = { success: true; data: T };

export async function explainScan(scanId: string): Promise<AIResponse> {
  const res = await apiClient.post<ApiWrap<AIResponse>>('/ai/explain', { scanId });
  return res.data.data;
}
