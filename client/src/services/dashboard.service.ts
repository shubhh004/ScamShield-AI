import apiClient from '@/lib/api/apiClient';
import type { DashboardData, AnalyticsData } from '@/types/dashboard';

export async function getDashboard(): Promise<DashboardData> {
  const res = await apiClient.get<{ success: true; data: DashboardData }>('/dashboard');
  return res.data.data;
}

export async function getAnalytics(): Promise<AnalyticsData> {
  const res = await apiClient.get<{ success: true; data: AnalyticsData }>('/analytics');
  return res.data.data;
}
